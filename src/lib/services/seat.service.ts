import type { SupabaseClient } from "@supabase/supabase-js";
import type { SeatLayout, SeatAvailabilityResponse, SeatStatus } from "@/types/seat";
import type { CabinClass } from "@/types/flight";
import {
  querySeatDefinitions,
  queryBookedSeats,
  queryFlightSeatOverrides,
  querySeatDefinitionsByNumbers,
  insertBookingSeats,
  queryBookingSeatsByBooking,
  deleteBookingSeats,
  queryCabinClassPrice,
  updateCabinClassAvailableSeats,
} from "@/lib/supabase/queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

export class SeatService {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Get layout metadata and occupied seat numbers for a flight + cabin class.
   * Derives seat status dynamically from seat_definition + booking_seat + flight_seat_override.
   */
  async getLayoutAndOccupied(
    flightId: string,
    cabinClass: CabinClass
  ): Promise<SeatAvailabilityResponse | null> {
    
    // 1. Fetch reusable seat definitions for this aircraft's cabin
    const { data: seatDefs, error: defsError } = await querySeatDefinitions(this.supabase, flightId, cabinClass);
    if (defsError || !seatDefs || seatDefs.length === 0) return null;

    // 2. Fetch booked seats for the flight
    const { data: booked, error: bookedError } = await queryBookedSeats(this.supabase, flightId);
    if (bookedError) throw new Error(`Booked seats fetch failed: ${bookedError.message}`);

    // 3. Fetch seat overrides (held, blocked)
    const { data: overrides, error: overridesError } = await queryFlightSeatOverrides(this.supabase, flightId);
    if (overridesError) throw new Error(`Seat overrides fetch failed: ${overridesError.message}`);

    // Derive Layout Meta
    let firstRow = Infinity;
    let lastRow = -Infinity;
    const colSet = new Set<string>();

    for (const def of seatDefs) {
      if (def.row_number < firstRow) firstRow = def.row_number;
      if (def.row_number > lastRow) lastRow = def.row_number;
      colSet.add(def.column_letter);
    }

    const COLUMN_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
    const columns = [...colSet].sort(
      (a, b) => COLUMN_ORDER.indexOf(a) - COLUMN_ORDER.indexOf(b)
    );

    const layout: SeatLayout = {
      flightId,
      cabinClass,
      firstRow,
      lastRow,
      rows: lastRow - firstRow + 1,
      columns,
    };

    // Calculate Statuses
    const bookedIds = new Set(booked?.map(b => b.seat_definition_id) || []);
    const overrideMap = new Map<string, { status: SeatStatus; expires_at: string | null }>();
    if (overrides) {
      for (const ov of overrides) {
        overrideMap.set(ov.seat_definition_id, { status: ov.status, expires_at: ov.expires_at });
      }
    }

    const seatsInfo: Record<string, {
      status: SeatStatus;
      isExitRow: boolean;
      isWindow: boolean;
      isAisle: boolean;
      rowNumber: number;
      columnLetter: string;
      priceModifier: number;
    }> = {};

    const now = new Date();

    for (const def of seatDefs) {
      let status: SeatStatus = "available";
      
      const ov = overrideMap.get(def.id);
      const isBooked = bookedIds.has(def.id);

      if (ov && ov.status === "blocked") {
        status = "blocked";
      } else if (ov && ov.status === "held") {
        if (!ov.expires_at || new Date(ov.expires_at) > now) {
          status = "held";
        } else if (isBooked) {
          status = "occupied";
        }
      } else if (isBooked) {
        status = "occupied";
      }

      // Calculate price modifier: Exit Row > Front Row > Standard
      let priceModifier = 0;
      if (def.is_exit_row) {
        priceModifier = 700;
      } else if (def.row_number === firstRow) {
        priceModifier = 300;
      }

      seatsInfo[def.seat_number] = {
        status,
        isExitRow: def.is_exit_row,
        isWindow: def.is_window,
        isAisle: def.is_aisle,
        rowNumber: def.row_number,
        columnLetter: def.column_letter,
        priceModifier
      };
    }

    return { 
      flightId,
      aircraftType: seatDefs[0].aircraft_type_id,
      cabinClass,
      layout, 
      seatsInfo 
    } as unknown as SeatAvailabilityResponse;
  }

  /**
   * Reserve specific seats — inserts booking_seat records.
   * Race condition protection via UNIQUE (flight_id, seat_definition_id) on booking_seat.
   */
  async reserveSeats(
    flightId: string,
    seatNumbers: string[],
    bookingId: string,
    cabinClass: CabinClass
  ): Promise<{ seatIds: string[] }> {
    
    // 1. Get the seat definitions by number
    const { data: seatDefs, error: fetchError } = await querySeatDefinitionsByNumbers(
      this.supabase, flightId, cabinClass, seatNumbers
    );

    if (fetchError) throw new Error(`Seat fetch failed: ${fetchError.message}`);
    if (!seatDefs || seatDefs.length !== seatNumbers.length) {
      throw new Error(`One or more seats not found in this cabin layout.`);
    }

    // 2. Validate availability (Check booking_seat and active overrides)
    const defIds = seatDefs.map(d => d.id);
    const { data: booked } = await queryBookedSeats(this.supabase, flightId);
    const { data: overrides } = await queryFlightSeatOverrides(this.supabase, flightId);

    const bookedIds = new Set(booked?.map(b => b.seat_definition_id) || []);
    const now = new Date();

    for (const def of seatDefs) {
      if (bookedIds.has(def.id)) {
        throw new Error(`Seat ${def.seat_number} is already occupied.`);
      }
      const ov = overrides?.find(o => o.seat_definition_id === def.id);
      if (ov) {
        if (ov.status === "blocked") {
          throw new Error(`Seat ${def.seat_number} is blocked.`);
        }
        if (ov.status === "held" && (!ov.expires_at || new Date(ov.expires_at) > now)) {
          throw new Error(`Seat ${def.seat_number} is currently held by another user.`);
        }
      }
    }

    // 3. Insert into booking_seat
    const aircraftTypeId = seatDefs[0].aircraft_type_id;
    const bookingSeatRecords = seatDefs.map((def) => ({
      booking_id: bookingId,
      flight_id: flightId,
      seat_definition_id: def.id,
      aircraft_type_id: aircraftTypeId
    }));

    const { error: bsError } = await insertBookingSeats(this.supabase, bookingSeatRecords);
    if (bsError) {
      if (bsError.code === "23505") {
        throw new Error("Seat already booked — please select another seat.");
      }
      throw new Error(`Booking seat record failed: ${bsError.message}`);
    }

    return { seatIds: defIds };
  }

  /**
   * Release seats for a cancelled booking.
   */
  async releaseSeats(bookingId: string): Promise<void> {
    const { error: deleteError } = await deleteBookingSeats(this.supabase, bookingId);
    if (deleteError) throw new Error(`Booking seat delete failed: ${deleteError.message}`);
  }

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

  async incrementAvailableSeats(
    flightId: string,
    cabinClass: import("@/types/flight").CabinClass,
    count: number
  ): Promise<void> {
    const { data, error: fetchError } = await queryCabinClassPrice(
      this.supabase, flightId, cabinClass
    );
    if (fetchError || !data) return; 

    const newAvailable = data.available_seats + count;
    await updateCabinClassAvailableSeats(this.supabase, data.id, newAvailable);
  }
}
