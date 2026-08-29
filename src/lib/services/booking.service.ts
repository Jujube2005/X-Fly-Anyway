import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Booking, CreateBookingPayload } from "@/types/booking";

/**
 * BookingService — all booking-related database operations.
 */
export class BookingService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Create a new booking */
  async createBooking(_payload: CreateBookingPayload): Promise<Booking> {
    // TODO: implement booking creation
    throw new Error("BookingService.createBooking — not yet implemented");
  }

  /** Get a booking by reference code */
  async getBookingByReference(_reference: string): Promise<Booking | null> {
    // TODO: implement booking lookup by reference
    throw new Error(
      "BookingService.getBookingByReference — not yet implemented"
    );
  }

  /** List all bookings (admin) */
  async listBookings(): Promise<Booking[]> {
    // TODO: implement admin booking list
    throw new Error("BookingService.listBookings — not yet implemented");
  }

  /** Cancel a booking */
  async cancelBooking(_bookingId: string): Promise<void> {
    // TODO: implement booking cancellation
    throw new Error("BookingService.cancelBooking — not yet implemented");
  }
}
