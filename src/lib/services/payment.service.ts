import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Payment, MockPaymentPayload } from "@/types/payment";

/**
 * PaymentService — mock payment processing.
 * Does NOT integrate with a real payment gateway.
 */
export class PaymentService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Process a mock payment — always succeeds unless the card number ends in "0000".
   * Returns a Payment record.
   */
  async processMockPayment(_payload: MockPaymentPayload): Promise<Payment> {
    // TODO: implement mock payment logic
    throw new Error("PaymentService.processMockPayment — not yet implemented");
  }

  /** Get payment record by booking ID */
  async getPaymentByBookingId(_bookingId: string): Promise<Payment | null> {
    // TODO: implement payment lookup
    throw new Error(
      "PaymentService.getPaymentByBookingId — not yet implemented"
    );
  }
}
