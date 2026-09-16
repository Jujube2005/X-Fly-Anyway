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

// ─── Seat ────────────────────────────────────────────────────────────────────

export async function querySeatMap(
  supabase: AnySupabaseClient,
  flightId: string,
  cabinClass: string
) {
  const result = await supabase
    .from("seat")
    .select("*")
    .eq("flight_id", flightId)
    .eq("cabin_class", cabinClass)
    .order("row_number", { ascending: true })
    .order("column_letter", { ascending: true });
  return result as { data: SeatRow[] | null; error: { message: string } | null };
}

export async function querySeatByNumber(
  supabase: AnySupabaseClient,
  flightId: string,
  seatNumber: string
) {
  const result = await supabase
    .from("seat")
    .select("*")
    .eq("flight_id", flightId)
    .eq("seat_number", seatNumber)
    .single();
  return result as { data: SeatRow | null; error: { message: string } | null };
}

export async function querySeatsByNumbers(
  supabase: AnySupabaseClient,
  flightId: string,
  seatNumbers: string[]
) {
  const result = await supabase
    .from("seat")
    .select("id, seat_number, status")
    .eq("flight_id", flightId)
    .in("seat_number", seatNumbers);
  return result as {
    data: Pick<SeatRow, "id" | "seat_number" | "status">[] | null;
    error: { message: string } | null;
  };
}

export async function updateSeatStatus(
  supabase: AnySupabaseClient,
  seatIds: string[],
  status: string
) {
  const result = await supabase
    .from("seat")
    .update({ status })
    .in("id", seatIds)
    .eq("status", "available");
  return result as { error: { message: string } | null };
}

export async function updateSeatStatusUnrestricted(
  supabase: AnySupabaseClient,
  seatIds: string[],
  status: string
) {
  const result = await supabase.from("seat").update({ status }).in("id", seatIds);
  return result as { error: { message: string } | null };
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
    .select("seat_id")
    .eq("booking_id", bookingId);
  return result as {
    data: Pick<BookingSeatRow, "seat_id">[] | null;
    error: { message: string } | null;
  };
}

export async function queryBookingSeatsWithSeat(
  supabase: AnySupabaseClient,
  bookingId: string
) {
  const result = await supabase
    .from("booking_seat")
    .select("seat_id, seat:seat_id(seat_number)")
    .eq("booking_id", bookingId);
  return result as {
    data: { seat_id: string; seat: { seat_number: string } | null }[] | null;
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
