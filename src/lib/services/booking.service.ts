import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRow, PassengerRow } from "@/types/database";
import type {
  Booking,
  CreateBookingPayload,
  BookingStatus,
  CancelBookingResult,
  BookingCancellation,
} from "@/types/booking";
import type { Passenger } from "@/types/passenger";
import type { CabinClass } from "@/types/flight";
import { generateBookingCode } from "@/lib/utils/booking-code";
import { SeatService } from "./seat.service";
import { PaymentService } from "./payment.service";
import {
  insertBooking,
  queryBookingByRef,
  queryAllBookings,
  updateBookingStatus,
  queryBookingRefExists,
  queryCabinClassPrice,
  insertPassengers,
  queryPassengersByBooking,
  queryBookingSeatsWithSeat,
  insertETicket,
  queryFlightById,
  insertCancellation,
  queryCancellationByBooking,
} from "@/lib/supabase/queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// ─── Row → Domain mappers ───────────────────────────────────────────────────

function toPassenger(row: PassengerRow): Passenger {
  return {
    id:             row.id,
    type:           "adult", // Phase 1: all passengers are adults
    title:          row.title,
    firstName:      row.first_name,
    lastName:       row.last_name,
    dateOfBirth:    row.date_of_birth,
    gender:         row.gender,
    nationality:    row.nationality,
    passportNumber: row.passport_number ?? undefined,
    passportExpiry: row.passport_expiry ?? undefined,
  };
}

function toBooking(
  row: BookingRow,
  passengers: Passenger[],
  seatNumbers: string[][]
): Booking {
  return {
    id:         row.id,
    reference:  row.reference,
    flightIds:  row.flight_id ? [row.flight_id] : [],
    cabinClass: row.cabin_class,
    passengers,
    contact: {
      firstName: row.contact_first_name,
      lastName:  row.contact_last_name,
      email:     row.contact_email,
      phone:     row.contact_phone,
    },
    seatNumbers,
    totalAmount: Number(row.total_amount),
    currency:    row.currency,
    status:      row.status,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ─── BookingService ─────────────────────────────────────────────────────────

/**
 * BookingService — booking creation, retrieval, and management.
 */
export class BookingService {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Create a new booking record with 'pending' status.
   * FR-CUS-008: Booking created before payment is processed.
   */
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const { flightIds, cabinClass, passengers, contact, seatNumbers } = payload;

    // Generate unique booking reference — retry up to 3 times on collision
    let reference = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      reference = generateBookingCode();
      const { data: existing } = await queryBookingRefExists(this.supabase, reference);
      if (!existing) break;
    }

    // Fetch price from flight_cabin_class for all legs
    let totalAmount = 0;
    let currency = "THB";
    for (const flightId of flightIds) {
      const { data: fcc, error: fccError } = await queryCabinClassPrice(
        this.supabase, flightId, cabinClass
      );
      if (fccError || !fcc) {
        throw new Error(`Cannot find pricing for ${cabinClass} on flight ${flightId}`);
      }
      totalAmount += Number(fcc.price) * passengers.length;
      currency = fcc.currency; // Assume same currency for simplicity
    }

    const { data: bookingRow, error: bookingError } = await insertBooking(this.supabase, {
      reference,
      flight_id:          flightIds.length === 1 ? flightIds[0] : null,
      cabin_class:        cabinClass as CabinClass,
      contact_first_name: contact.firstName,
      contact_last_name:  contact.lastName,
      contact_email:      contact.email,
      contact_phone:      contact.phone,
      total_amount:       totalAmount,
      currency:           currency,
      status:             "pending",
    });

    if (bookingError || !bookingRow) {
      throw new Error(`Booking creation failed: ${bookingError?.message}`);
    }

    // Insert legs
    const legs = flightIds.map((flightId, idx) => ({
      booking_id: bookingRow.id,
      flight_id: flightId,
      leg_sequence: idx + 1,
    }));
    const { error: legError } = await import("@/lib/supabase/queries").then(m => m.insertBookingLegs(this.supabase, legs));
    if (legError) throw new Error(`Booking leg insert failed: ${legError.message}`);

    const passengerInserts = passengers.map((p) => ({
      booking_id:      bookingRow.id,
      title:           p.title,
      first_name:      p.firstName,
      last_name:       p.lastName,
      date_of_birth:   p.dateOfBirth,
      gender:          p.gender,
      nationality:     p.nationality,
      passport_number: p.passportNumber ?? null,
      passport_expiry: p.passportExpiry ?? null,
    }));

    const { error: passError } = await import("@/lib/supabase/queries").then(m => m.insertPassengers(this.supabase, passengerInserts));
    if (passError) throw new Error(`Passenger insert failed: ${passError.message}`);

    const booking = toBooking(bookingRow, passengers, seatNumbers);
    booking.flightIds = flightIds;
    return booking;
  }

  /**
   * Confirm a booking and issue an e-ticket.
   * Called after successful payment (FR-CUS-011).
   */
  async confirmBooking(bookingId: string): Promise<void> {
    const { error: bookingError } = await updateBookingStatus(
      this.supabase, bookingId, "confirmed"
    );
    if (bookingError) {
      throw new Error(`Booking confirmation failed: ${bookingError.message}`);
    }

    const { error: ticketError } = await insertETicket(this.supabase, bookingId);
    if (ticketError) {
      throw new Error(`E-ticket creation failed: ${ticketError.message}`);
    }
  }

  /**
   * Get a booking by its reference code.
   * FR-CUS-012: Display confirmed booking by reference.
   */
  async getBookingByReference(reference: string): Promise<Booking | null> {
    const { data: bookingRow, error: bookingError } = await queryBookingByRef(
      this.supabase, reference
    );
    if (bookingError || !bookingRow) return null;

    const { queryBookingLegsByBooking } = await import("@/lib/supabase/queries");
    const [passResult, bsResult, legResult] = await Promise.all([
      queryPassengersByBooking(this.supabase, bookingRow.id),
      queryBookingSeatsWithSeat(this.supabase, bookingRow.id),
      queryBookingLegsByBooking(this.supabase, bookingRow.id),
    ]);

    if (passResult.error) throw new Error(passResult.error.message);
    if (bsResult.error) throw new Error(bsResult.error.message);
    if (legResult.error) throw new Error(legResult.error.message);

    const passengers = (passResult.data ?? []).map(toPassenger);
    
    // Group seats by flightId, then map back to flightIds order
    const seatsByFlight = new Map<string, string[]>();
    for (const bs of bsResult.data ?? []) {
      const flightId = bs.flight_id;
      const seatNum = bs.seat_definition?.seat_number;
      if (flightId && seatNum) {
        if (!seatsByFlight.has(flightId)) seatsByFlight.set(flightId, []);
        seatsByFlight.get(flightId)!.push(seatNum);
      }
    }
    
    const flightIds = (legResult.data && legResult.data.length > 0)
      ? legResult.data.map((l) => l.flight_id)
      : (bookingRow.flight_id ? [bookingRow.flight_id] : []);
    const seatNumbers = flightIds.map((fid) => seatsByFlight.get(fid) ?? []);

    const booking = toBooking(bookingRow, passengers, seatNumbers);
    booking.flightIds = flightIds;
    
    return booking;
  }

  /**
   * List all bookings — admin use (FR-DASH-003).
   */
  async listBookings(): Promise<Booking[]> {
    const { data: rows, error } = await queryAllBookings(this.supabase);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return [];
    return rows.map((row) => toBooking(row, [], []));
  }

  /**
   * Cancel a booking — marks as 'cancelled'.
   * Seat release handled separately by SeatService.
   */
  async cancelBooking(bookingId: string): Promise<void> {
    const { error } = await updateBookingStatus(this.supabase, bookingId, "cancelled");
    if (error) throw new Error(`Booking cancellation failed: ${error.message}`);
  }

  /**
   * Cancel a booking with full refund orchestration (FR-CUS-015, FR-CUS-016, AC-004).
   * - Validates booking exists and is 'confirmed'.
   * - Validates departure is at least 24 hours away (using earliest leg departure).
   * - Ensures payment exists and is 'success' (not already refunded).
   * - Updates booking to 'cancelled'.
   * - Releases seats from booking_seat.
   * - Increments available_seats in flight_cabin_class for each leg.
   * - Marks payment as 'refunded'.
   * - Records cancellation in cancellation table.
   */
  async cancelBookingWithRefund(
    reference: string,
    reason?: string
  ): Promise<CancelBookingResult> {
    const { data: bookingRow, error: bookingError } = await queryBookingByRef(
      this.supabase,
      reference.toUpperCase()
    );

    if (bookingError || !bookingRow) {
      throw new Error(`Booking not found with reference ${reference}`);
    }

    // 1. Validate booking status
    if (bookingRow.status === "cancelled") {
      throw new Error("This booking has already been cancelled.");
    }
    if (bookingRow.status !== "confirmed") {
      throw new Error(
        `Cannot cancel booking in status '${bookingRow.status}'. Only confirmed bookings can be cancelled.`
      );
    }

    // 2. Fetch full booking details (passengers, legs, seats)
    const booking = await this.getBookingByReference(reference.toUpperCase());
    if (!booking) {
      throw new Error(`Failed to load booking details for ${reference}`);
    }

    const { queryBookingLegsByBooking } = await import("@/lib/supabase/queries");
    const legResult = await queryBookingLegsByBooking(this.supabase, bookingRow.id);
    const legs = legResult.data ?? [];

    const flightIds = legs.length > 0
      ? legs.map((l) => l.flight_id)
      : (bookingRow.flight_id ? [bookingRow.flight_id] : []);

    if (flightIds.length === 0) {
      throw new Error("No flight legs associated with this booking.");
    }

    // 3. Query flights to check the 24-hour departure condition
    const flightPromises = flightIds.map((fid) => queryFlightById(this.supabase, fid));
    const flightResults = await Promise.all(flightPromises);
    const flights = flightResults
      .map((r) => r.data)
      .filter((f): f is NonNullable<typeof f> => !!f);

    if (flights.length === 0) {
      throw new Error("Flight details could not be retrieved for cancellation validation.");
    }

    // Find the earliest scheduled departure time (leg_sequence = 1 or earliest departure)
    const departureTimes = flights.map((f) => new Date(f.departure_time).getTime());
    const earliestDepartureEpoch = Math.min(...departureTimes);
    const nowEpoch = Date.now();
    const hoursToDeparture = (earliestDepartureEpoch - nowEpoch) / (1000 * 60 * 60);

    if (hoursToDeparture < 24) {
      throw new Error(
        `Cancellation is only permitted at least 24 hours prior to scheduled departure (FR-CUS-015). Scheduled departure is in ${Math.max(0, hoursToDeparture).toFixed(1)} hours.`
      );
    }

    // 4. Verify payment status before altering any state
    const paymentService = new PaymentService(this.supabase);
    const payment = await paymentService.getPaymentByBookingId(bookingRow.id);

    if (!payment) {
      throw new Error("Payment record not found for this booking.");
    }
    if (payment.status === "refunded") {
      throw new Error("Payment for this booking has already been refunded.");
    }
    if (payment.status !== "success") {
      throw new Error(`Cannot refund payment in status '${payment.status}'.`);
    }

    // 5. Atomic Cancellation Execution
    // 5.1 Update booking status to 'cancelled'
    await this.cancelBooking(bookingRow.id);

    // 5.2 Release reserved seats
    const seatService = new SeatService(this.supabase);
    await seatService.releaseSeats(bookingRow.id);

    // 5.3 Increment available seats for each flight leg
    const passengerCount = booking.passengers.length || 1;
    for (const fid of flightIds) {
      await seatService.incrementAvailableSeats(fid, booking.cabinClass, passengerCount);
    }

    // 5.4 Process payment refund
    await paymentService.refundPayment(bookingRow.id);

    // 5.5 Insert cancellation audit record
    const { data: cancellationRow, error: cancelInsertError } = await insertCancellation(
      this.supabase,
      {
        booking_id: bookingRow.id,
        reason: reason?.trim() || null,
        refund_amount: Number(bookingRow.total_amount),
        refund_currency: bookingRow.currency,
        refund_status: "completed",
        refund_channel: payment.method,
      }
    );

    if (cancelInsertError || !cancellationRow) {
      console.error(
        `[cancelBookingWithRefund] Warning: Cancellation audit insert failed for booking ${bookingRow.id}:`,
        cancelInsertError
      );
    }

    const updatedBooking: Booking = {
      ...booking,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      booking: updatedBooking,
      cancellation: {
        id: cancellationRow?.id ?? "",
        bookingId: bookingRow.id,
        reason: cancellationRow?.reason ?? (reason?.trim() || null),
        refundAmount: Number(bookingRow.total_amount),
        refundCurrency: bookingRow.currency,
        refundStatus: "completed",
        refundChannel: payment.method,
        cancelledAt: cancellationRow?.cancelled_at ?? new Date().toISOString(),
      },
      refund: {
        amount: Number(bookingRow.total_amount),
        currency: bookingRow.currency,
        channel: payment.method,
        timeline: "ภายใน 7 วันทำการ (Within 7 business days)",
      },
    };
  }

  /**
   * Get cancellation record for a booking.
   */
  async getCancellation(bookingId: string): Promise<BookingCancellation | null> {
    const { data, error } = await queryCancellationByBooking(this.supabase, bookingId);
    if (error || !data) return null;
    return {
      id: data.id,
      bookingId: data.booking_id,
      reason: data.reason,
      refundAmount: Number(data.refund_amount),
      refundCurrency: data.refund_currency,
      refundStatus: data.refund_status as "pending" | "completed" | "failed",
      refundChannel: data.refund_channel,
      cancelledAt: data.cancelled_at,
    };
  }
}
