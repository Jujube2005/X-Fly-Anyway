import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRow, PassengerRow } from "@/types/database";
import type { Booking, CreateBookingPayload } from "@/types/booking";
import type { Passenger } from "@/types/passenger";
import type { CabinClass } from "@/types/flight";
import { generateBookingCode } from "@/lib/utils/booking-code";
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
}
