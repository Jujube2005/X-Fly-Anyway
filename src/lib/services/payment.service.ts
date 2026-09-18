import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentRow } from "@/types/database";
import type { Payment, MockPaymentPayload, PaymentMethod } from "@/types/payment";
import {
  insertPayment,
  updatePayment,
  queryPaymentByBooking,
  updatePaymentStatusByBooking,
} from "@/lib/supabase/queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// ─── Row → Domain mapper ────────────────────────────────────────────────────

function toPayment(row: PaymentRow): Payment {
  return {
    id:             row.id,
    bookingId:      row.booking_id,
    amount:         Number(row.amount),
    currency:       row.currency,
    method:         row.method,
    status:         row.status,
    transactionRef: row.transaction_ref ?? undefined,
    paidAt:         row.paid_at ?? undefined,
    createdAt:      row.created_at,
  };
}

// ─── Mock payment simulation ─────────────────────────────────────────────────

/**
 * Simulate payment outcome.
 * SRS OI-005: Mock Payment Gateway.
 * - credit_card / card_charge: fails if card number ends in "0000"
 * - bitcoin: always succeeds
 */
function simulatePaymentOutcome(payload: MockPaymentPayload): {
  success: boolean;
  failReason?: string;
} {
  if (payload.method === "bitcoin") return { success: true };

  if (payload.card) {
    const cleaned = payload.card.cardNumber.replace(/\s/g, "");
    if (cleaned.endsWith("0000")) {
      return { success: false, failReason: "Card declined by issuer (test cards ending in 0000 simulate failure)." };
    }
    let year = payload.card.expiryYear;
    if (year < 100) year += 2000;
    // Allow any expiration from year 2025 onwards for testing
    if (year < 2025) {
      return { success: false, failReason: "Card expired." };
    }
  }

  return { success: true };
}

function generateTransactionRef(method: PaymentMethod): string {
  const prefix: Record<PaymentMethod, string> = {
    credit_card: "CC",
    card_charge: "DC",
    bitcoin:     "BTC",
  };
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix[method]}-${Date.now()}-${random}`;
}

// ─── PaymentService ──────────────────────────────────────────────────────────

/**
 * PaymentService — mock payment processing for Phase 1.
 * SRS OI-005: Mock Payment Gateway — no real money movement.
 * FR-CUS-010: Supports Credit Card, Card Charge, and Bitcoin.
 */
export class PaymentService {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Process a mock payment.
   * FR-CUS-011: Payment failure must NOT confirm the booking.
   */
  async processMockPayment(payload: MockPaymentPayload): Promise<Payment> {
    const { bookingId, amount, currency, method } = payload;

    const { data: pendingRow, error: insertError } = await insertPayment(this.supabase, {
      booking_id: bookingId,
      amount,
      currency,
      method,
      status: "pending",
    });

    if (insertError || !pendingRow) {
      throw new Error(`Payment record creation failed: ${insertError?.message}`);
    }

    const outcome = simulatePaymentOutcome(payload);

    if (outcome.success) {
      const transactionRef = generateTransactionRef(method);
      const paidAt = new Date().toISOString();

      const { data: successRow, error: successError } = await updatePayment(
        this.supabase, pendingRow.id, {
          status:          "success",
          transaction_ref: transactionRef,
          paid_at:         paidAt,
        }
      );

      if (successError || !successRow) {
        throw new Error(`Payment success update failed: ${successError?.message}`);
      }

      return toPayment(successRow);
    } else {
      const { data: failedRow, error: failedError } = await updatePayment(
        this.supabase, pendingRow.id, { status: "failed" }
      );

      if (failedError || !failedRow) {
        throw new Error(`Payment failure update failed: ${failedError?.message}`);
      }

      return toPayment(failedRow);
    }
  }

  /**
   * Get payment record by booking ID.
   */
  async getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
    const { data, error } = await queryPaymentByBooking(this.supabase, bookingId);
    if (error || !data) return null;
    return toPayment(data);
  }

  /**
   * Refund a payment — mock only.
   */
  async refundPayment(bookingId: string): Promise<void> {
    const { error } = await updatePaymentStatusByBooking(
      this.supabase, bookingId, "refunded", "success"
    );
    if (error) throw new Error(`Refund failed: ${error.message}`);
  }
}
