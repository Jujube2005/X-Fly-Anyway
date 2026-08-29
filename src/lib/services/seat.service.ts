import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SeatMap } from "@/types/seat";
import type { CabinClass } from "@/types/flight";

/**
 * SeatService — seat map retrieval and seat reservation operations.
 */
export class SeatService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Get the seat map for a flight and cabin class */
  async getSeatMap(
    _flightId: string,
    _cabinClass: CabinClass
  ): Promise<SeatMap | null> {
    // TODO: implement seat map retrieval
    throw new Error("SeatService.getSeatMap — not yet implemented");
  }

  /** Reserve specific seats for a booking */
  async reserveSeats(
    _flightId: string,
    _seatNumbers: string[],
    _bookingId: string
  ): Promise<void> {
    // TODO: implement seat reservation
    throw new Error("SeatService.reserveSeats — not yet implemented");
  }

  /** Release previously reserved seats */
  async releaseSeats(_bookingId: string): Promise<void> {
    // TODO: implement seat release
    throw new Error("SeatService.releaseSeats — not yet implemented");
  }
}
