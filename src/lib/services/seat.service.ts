import type { SupabaseClient } from "@supabase/supabase-js";
import type { SeatRow } from "@/types/database";
import type { Seat, SeatMap } from "@/types/seat";
import type { CabinClass } from "@/types/flight";
import {
  querySeatMap,
  querySeatByNumber,
  querySeatsByNumbers,
  updateSeatStatus,
  updateSeatStatusUnrestricted,
  insertBookingSeats,
  queryBookingSeatsByBooking,
  deleteBookingSeats,
  queryCabinClassPrice,
  updateCabinClassAvailableSeats,
} from "@/lib/supabase/queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// ─── Row → Domain mapper ────────────────────────────────────────────────────

function toSeat(row: SeatRow): Seat {
  return {
    id:           row.id,
    flightId:     row.flight_id,
    seatNumber:   row.seat_number,
    rowNumber:    row.row_number,
    columnLetter: row.column_letter,
    cabinClass:   row.cabin_class,
    isWindow:     row.is_window,
    isAisle:      row.is_aisle,
    isExitRow:    row.is_exit_row,
    status:       row.status,
  };
}

// ─── Column layouts by cabin class ─────────────────────────────────────────
const CABIN_COLUMNS: Record<CabinClass, string[]> = {
  economy:         ["A", "B", "C", "D", "E", "F"],
  premium_economy: ["A", "B", "C", "D", "E", "F"],
  business:        ["A", "B", "C", "D"],
  first:           ["A", "B", "C", "D"],
};

// ─── SeatService ────────────────────────────────────────────────────────────

/**
 * SeatService — seat map retrieval and seat reservation operations.
 */
export class SeatService {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Get the seat map for a specific flight and cabin class.
   * FR-CUS-005: Display seat map with available/occupied status.
   */
  async getSeatMap(
    flightId: string,
    cabinClass: CabinClass
  ): Promise<SeatMap | null> {
    const { data, error } = await querySeatMap(this.supabase, flightId, cabinClass);
    if (error) throw new Error(`Seat map fetch failed: ${error.message}`);
    if (!data || data.length === 0) return null;

    const seats = data.map(toSeat);
    const rows = Math.max(...seats.map((s) => s.rowNumber));
    const columns = CABIN_COLUMNS[cabinClass];

    return { flightId, cabinClass, rows, columns, seats };
  }

  /**
   * Get a single seat by flight + seat number.
   */
  async getSeatByNumber(
    flightId: string,
    seatNumber: string
  ): Promise<Seat | null> {
    const { data, error } = await querySeatByNumber(this.supabase, flightId, seatNumber);
    if (error || !data) return null;
    return toSeat(data);
  }

  /**
   * Reserve specific seats — marks as 'occupied' and inserts booking_seat records.
   * FR-CUS-006: Seat availability validated server-side.
   * Race condition protection via UNIQUE (seat_id) on booking_seat.
   */
  async reserveSeats(
    flightId: string,
    seatNumbers: string[],
    bookingId: string
  ): Promise<{ seatIds: string[] }> {
    const { data: seats, error: fetchError } = await querySeatsByNumbers(
      this.supabase, flightId, seatNumbers
    );

    if (fetchError) throw new Error(`Seat fetch failed: ${fetchError.message}`);
    if (!seats || seats.length !== seatNumbers.length) {
      throw new Error(`One or more seats not found: ${seatNumbers.join(", ")}`);
    }

    const unavailable = seats.filter((s) => s.status !== "available");
    if (unavailable.length > 0) {
      throw new Error(
        `Seats not available: ${unavailable.map((s) => s.seat_number).join(", ")}`
      );
    }

    const seatIds = seats.map((s) => s.id);

    const { error: updateError } = await updateSeatStatus(this.supabase, seatIds, "occupied");
    if (updateError) throw new Error(`Seat reservation failed: ${updateError.message}`);

    const bookingSeatRecords = seatIds.map((seatId) => ({
      booking_id: bookingId,
      seat_id:    seatId,
    }));

    const { error: bsError } = await insertBookingSeats(this.supabase, bookingSeatRecords);
    if (bsError) {
      if (bsError.code === "23505") {
        throw new Error("Seat already booked — please select another seat.");
      }
      throw new Error(`Booking seat record failed: ${bsError.message}`);
    }

    return { seatIds };
  }

  /**
   * Release seats for a cancelled booking — marks back as 'available'.
   */
  async releaseSeats(bookingId: string): Promise<void> {
    const { data: bsRows, error: bsError } = await queryBookingSeatsByBooking(
      this.supabase, bookingId
    );
    if (bsError) throw new Error(`Seat release fetch failed: ${bsError.message}`);
    if (!bsRows || bsRows.length === 0) return;

    const seatIds = bsRows.map((r) => r.seat_id);

    const { error: updateError } = await updateSeatStatusUnrestricted(
      this.supabase, seatIds, "available"
    );
    if (updateError) throw new Error(`Seat release update failed: ${updateError.message}`);

    const { error: deleteError } = await deleteBookingSeats(this.supabase, bookingId);
    if (deleteError) throw new Error(`Booking seat delete failed: ${deleteError.message}`);
  }

  /**
   * Decrement available_seats count for a cabin class after booking.
   */
  async decrementAvailableSeats(
    flightId: string,
    cabinClass: CabinClass,
    count: number
  ): Promise<void> {
    const { data, error: fetchError } = await queryCabinClassPrice(
      this.supabase, flightId, cabinClass
    );
    if (fetchError || !data) {
      throw new Error(`Cabin class not found: ${flightId}/${cabinClass}`);
    }

    const newAvailable = Math.max(0, data.available_seats - count);
    const { error: updateError } = await updateCabinClassAvailableSeats(
      this.supabase, data.id, newAvailable
    );
    if (updateError) {
      throw new Error(`Available seats decrement failed: ${updateError.message}`);
    }
  }
}
