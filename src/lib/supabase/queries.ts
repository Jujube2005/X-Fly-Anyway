import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AirportRow,
  FlightRow,
  FlightCabinClassRow,
  SeatRow,
  BookingRow,
  PassengerRow,
  BookingSeatRow,
  PaymentRow,
} from "@/types/database";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// ─── Airport ────────────────────────────────────────────────────────────────


export async function queryAirports(
  supabase: AnySupabaseClient,
  codes?: string[]
) {
  const q = supabase.from("airport").select("*");
  if (codes && codes.length > 0) q.in("id", codes);
  const result = await q;
  return result as { data: AirportRow[] | null; error: { message: string } | null };
}

/** Resolve IATA codes (e.g. ["BKK", "CNX"]) → full airport rows.
 *  Since airport.id IS the IATA code, this is just a filtered queryAirports. */
export async function queryAirportsByCode(
  supabase: AnySupabaseClient,
  codes: string[]
) {
  const result = await supabase
    .from("airport")
    .select("*")
    .in("id", codes);
  return result as { data: AirportRow[] | null; error: { message: string } | null };
}

export async function queryAirportsOrdered(supabase: AnySupabaseClient) {
  const result = await supabase
    .from("airport")
    .select("*")
    .order("country", { ascending: true })
    .order("city", { ascending: true });
  return result as { data: AirportRow[] | null; error: { message: string } | null };
}

// ─── Flight ─────────────────────────────────────────────────────────────────

export async function queryFlightById(supabase: AnySupabaseClient, id: string) {
  const result = await supabase.from("flight").select("*").eq("id", id).single();
  return result as { data: FlightRow | null; error: { message: string } | null };
}

/**
 * Search flights by IATA airport codes and time window.
 */
export async function queryFlightSearch(
  supabase: AnySupabaseClient,
  originCode: string,
  destinationCode: string,
  dayStart: string,
  dayEnd: string
) {
  const result = await supabase
    .from("flight")
    .select("*")
    .eq("origin_airport_id", originCode)
    .eq("destination_airport_id", destinationCode)
    .gte("departure_time", dayStart)
    .lte("departure_time", dayEnd)
    .order("departure_time", { ascending: true });
  return result as { data: FlightRow[] | null; error: { message: string } | null };
}

export async function queryFlightsByOrigin(
  supabase: AnySupabaseClient,
  originCode: string,
  dayStart: string,
  dayEnd: string
) {
  const result = await supabase
    .from("flight")
    .select("*")
    .eq("origin_airport_id", originCode)
    .gte("departure_time", dayStart)
    .lte("departure_time", dayEnd)
    .order("departure_time", { ascending: true });
  return result as { data: FlightRow[] | null; error: { message: string } | null };
}

export async function queryFlightsByDestination(
  supabase: AnySupabaseClient,
  destinationCode: string,
  minDepartureTime: string,
  maxDepartureTime: string
) {
  const result = await supabase
    .from("flight")
    .select("*")
    .eq("destination_airport_id", destinationCode)
    .gte("departure_time", minDepartureTime)
    .lte("departure_time", maxDepartureTime)
    .order("departure_time", { ascending: true });
  return result as { data: FlightRow[] | null; error: { message: string } | null };
}

export async function queryAllFlights(supabase: AnySupabaseClient) {
  const result = await supabase
    .from("flight")
    .select("*")
    .order("departure_time", { ascending: true });
  return result as { data: FlightRow[] | null; error: { message: string } | null };
}

// ─── FlightCabinClass ────────────────────────────────────────────────────────────

export async function queryCabinClassesByFlight(
  supabase: AnySupabaseClient,
  flightId: number | string
) {
  const result = await supabase
    .from("flight_cabin_class")
    .select("*")
    .eq("flight_id", flightId)
    .order("price", { ascending: true });
  return result as { data: FlightCabinClassRow[] | null; error: { message: string } | null };
}

export async function queryCabinClassesByFlights(
  supabase: AnySupabaseClient,
  flightIds: string[],
  cabinClass?: string,
  minSeats?: number
) {
  let q = supabase
    .from("flight_cabin_class")
    .select("*")
    .in("flight_id", flightIds);
  if (cabinClass) q = q.eq("cabin_class", cabinClass);
  if (minSeats !== undefined) q = q.gte("available_seats", minSeats);
  const result = await q;
  return result as { data: FlightCabinClassRow[] | null; error: { message: string } | null };
}

export async function queryCabinClassPrice(
  supabase: AnySupabaseClient,
  flightId: string,
  cabinClass: string
) {
  const result = await supabase
    .from("flight_cabin_class")
    .select("id, price, currency, available_seats")
    .eq("flight_id", flightId)
    .eq("cabin_class", cabinClass)
    .single();
  return result as {
    data: Pick<FlightCabinClassRow, "id" | "price" | "currency" | "available_seats"> | null;
    error: { message: string } | null;
  };
}

export async function updateCabinClassAvailableSeats(
  supabase: AnySupabaseClient,
  id: string,
  availableSeats: number
) {
  const result = await supabase
    .from("flight_cabin_class")
    .update({ available_seats: availableSeats })
    .eq("id", id);
  return result as { error: { message: string } | null };
}

// ─── Seat Architecture (New) ──────────────────────────────────────────────────

export async function querySeatDefinitions(
  supabase: AnySupabaseClient,
  flightId: string,
  cabinClass: string
) {
  const flightResult = await supabase
    .from("flight")
    .select("aircraft_type_id")
    .eq("id", flightId)
    .single();
    
  if (flightResult.error || !flightResult.data?.aircraft_type_id) {
    return { data: null, error: flightResult.error || new Error("Flight not found") };
  }
  const aircraftTypeId = flightResult.data.aircraft_type_id;

  const cabinResult = await supabase
    .from("cabin_layout")
    .select("id")
    .eq("aircraft_type_id", aircraftTypeId)
    .eq("cabin_class", cabinClass)
    .single();

  if (cabinResult.error || !cabinResult.data) {
    return { data: null, error: cabinResult.error || new Error("Cabin layout not found") };
  }

  const result = await supabase
    .from("seat_definition")
    .select("*")
    .eq("cabin_layout_id", cabinResult.data.id)
    .order("row_number", { ascending: true })
    .order("column_letter", { ascending: true });

  return result as { data: import("@/types/database").SeatDefinitionRow[] | null; error: { message: string } | null };
}

export async function queryBookedSeats(
  supabase: AnySupabaseClient,
  flightId: string
) {
  const result = await supabase
    .from("booking_seat")
    .select("seat_definition_id")
    .eq("flight_id", flightId);
  return result as { data: { seat_definition_id: string }[] | null; error: { message: string } | null };
}

export async function queryFlightSeatOverrides(
  supabase: AnySupabaseClient,
  flightId: string
) {
  const result = await supabase
    .from("flight_seat_override")
    .select("seat_definition_id, status, expires_at")
    .eq("flight_id", flightId);
  return result as { 
    data: { seat_definition_id: string; status: "held" | "blocked"; expires_at: string | null }[] | null; 
    error: { message: string } | null 
  };
}

export async function querySeatDefinitionsByNumbers(
  supabase: AnySupabaseClient,
  flightId: string,
  cabinClass: string,
  seatNumbers: string[]
) {
  const flightResult = await supabase.from("flight").select("aircraft_type_id").eq("id", flightId).single();
  if (flightResult.error || !flightResult.data) return { data: null, error: flightResult.error || new Error("Flight not found") };

  const cabinResult = await supabase.from("cabin_layout").select("id").eq("aircraft_type_id", flightResult.data.aircraft_type_id).eq("cabin_class", cabinClass).single();
  if (cabinResult.error || !cabinResult.data) return { data: null, error: cabinResult.error || new Error("Cabin not found") };

  const result = await supabase
    .from("seat_definition")
    .select("*")
    .eq("cabin_layout_id", cabinResult.data.id)
    .in("seat_number", seatNumbers);

  return result as { data: import("@/types/database").SeatDefinitionRow[] | null; error: { message: string } | null };
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export async function insertBooking(
  supabase: AnySupabaseClient,
  values: Partial<BookingRow>
) {
  const result = await supabase.from("booking").insert(values).select().single();
  return result as { data: BookingRow | null; error: { message: string; code?: string } | null };
}

export async function queryBookingByRef(
  supabase: AnySupabaseClient,
  reference: string
) {
  const result = await supabase
    .from("booking")
    .select("*")
    .eq("reference", reference)
    .single();
  return result as { data: BookingRow | null; error: { message: string } | null };
}

export async function queryBookingById(
  supabase: AnySupabaseClient,
  id: string
) {
  const result = await supabase.from("booking").select("*").eq("id", id).single();
  return result as { data: BookingRow | null; error: { message: string } | null };
}

export async function queryAllBookings(supabase: AnySupabaseClient) {
  const result = await supabase
    .from("booking")
    .select("*")
    .order("created_at", { ascending: false });
  return result as { data: BookingRow[] | null; error: { message: string } | null };
}

export async function updateBookingStatus(
  supabase: AnySupabaseClient,
  id: string,
  status: string
) {
  const result = await supabase.from("booking").update({ status }).eq("id", id);
  return result as { error: { message: string } | null };
}

export async function queryBookingRefExists(
  supabase: AnySupabaseClient,
  reference: string
) {
  const result = await supabase
    .from("booking")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();
  return result as { data: { id: string } | null; error: { message: string } | null };
}

// ─── Passenger ───────────────────────────────────────────────────────────────

export async function insertBookingLegs(
  supabase: AnySupabaseClient,
  legs: Partial<import("@/types/database").BookingLegRow>[]
) {
  const result = await supabase.from("booking_leg").insert(legs);
  return result as { error: { message: string } | null };
}

export async function queryBookingLegsByBooking(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("booking_leg")
    .select("*")
    .eq("booking_id", bookingId)
    .order("leg_sequence", { ascending: true });
  return result as { data: import("@/types/database").BookingLegRow[] | null; error: { message: string } | null };
}

export async function insertPassengers(
  supabase: AnySupabaseClient,
  passengers: Partial<PassengerRow>[]
) {
  const result = await supabase.from("passenger").insert(passengers);
  return result as { error: { message: string } | null };
}

export async function queryPassengersByBooking(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("passenger")
    .select("*")
    .eq("booking_id", bookingId);
  return result as { data: PassengerRow[] | null; error: { message: string } | null };
}

// ─── BookingSeat ─────────────────────────────────────────────────────────────

export async function insertBookingSeats(
  supabase: AnySupabaseClient,
  records: Partial<BookingSeatRow>[]
) {
  const result = await supabase.from("booking_seat").insert(records);
  return result as { error: { message: string; code?: string } | null };
}

export async function queryBookingSeatsByBooking(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("booking_seat")
    .select("*")
    .eq("booking_id", bookingId);
  return result as {
    data: BookingSeatRow[] | null;
    error: { message: string } | null;
  };
}

export async function queryBookingSeatsWithSeat(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("booking_seat")
    .select("seat_definition_id, flight_id, seat_definition:seat_definition_id(seat_number)")
    .eq("booking_id", bookingId);
  return result as {
    data: { seat_definition_id: string; flight_id: string; seat_definition: { seat_number: string } | null }[] | null;
    error: { message: string } | null;
  };
}

export async function deleteBookingSeats(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("booking_seat")
    .delete()
    .eq("booking_id", bookingId);
  return result as { error: { message: string } | null };
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export async function insertPayment(
  supabase: AnySupabaseClient,
  values: Partial<PaymentRow>
) {
  const result = await supabase.from("payment").insert(values).select().single();
  return result as { data: PaymentRow | null; error: { message: string } | null };
}

export async function updatePayment(
  supabase: AnySupabaseClient,
  id: string,
  values: Partial<PaymentRow>
) {
  const result = await supabase
    .from("payment")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  return result as { data: PaymentRow | null; error: { message: string } | null };
}

export async function queryPaymentByBooking(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("payment")
    .select("*")
    .eq("booking_id", bookingId)
    .single();
  return result as { data: PaymentRow | null; error: { message: string } | null };
}

export async function updatePaymentStatusByBooking(
  supabase: AnySupabaseClient,
  bookingId: string,
  status: string,
  fromStatus?: string
) {
  let q = supabase.from("payment").update({ status }).eq("booking_id", bookingId);
  if (fromStatus) q = q.eq("status", fromStatus);
  const result = await q;
  return result as { error: { message: string } | null };
}

// ─── E-Ticket ────────────────────────────────────────────────────────────────

export async function insertETicket(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("e_ticket")
    .insert({ booking_id: bookingId });
  return result as { error: { message: string } | null };
}
