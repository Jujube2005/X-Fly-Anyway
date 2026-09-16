import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FlightRow,
  FlightCabinClassRow,
  AirportRow,
} from "@/types/database";
import type {
  Flight,
  Airport,
  FlightCabinClassInfo,
  FlightSearchParams,
  FlightSearchResult,
  CabinClass,
} from "@/types/flight";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

import {
  queryFlightSearch,
  queryFlightById,
  queryAllFlights,
  queryCabinClassesByFlight,
  queryCabinClassesByFlights,
  queryCabinClassPrice,
  queryAirports,
  queryAirportsByCode,
  queryAirportsOrdered,
} from "@/lib/supabase/queries";


// ─── Row → Domain mappers ───────────────────────────────────────────────────

function toAirport(row: AirportRow): Airport {
  return {
    airport_code: row.airport_code,         // IATA code field (not the integer id)
    name:         row.name         ?? "",
    city:         row.city         ?? "",
    country:      row.country      ?? "",
    country_code: row.country_code ?? "",
    timezone:     row.timezone     ?? "",
  };
}

function toCabinClassInfo(row: FlightCabinClassRow): FlightCabinClassInfo {
  return {
    cabinClass:     row.cabin_class,
    price:          Number(row.price),
    currency:       row.currency,
    totalSeats:     row.total_seats,
    availableSeats: row.available_seats,
  };
}

function toFlight(
  row: FlightRow,
  origin: Airport,
  destination: Airport,
  cabinClasses: FlightCabinClassInfo[]
): Flight {
  const durationMs =
    new Date(row.arrival_time).getTime() - new Date(row.departure_time).getTime();

  return {
    id:              String(row.id),   // convert integer PK to string for domain layer
    flightNumber:    row.flight_number,
    origin,
    destination,
    departureAt:     row.departure_time,
    arrivalAt:       row.arrival_time,
    durationMinutes: Math.round(durationMs / 60_000),
    cabinClasses,
  };
}

// ─── FlightService ──────────────────────────────────────────────────────────

/**
 * FlightService — all flight-related database operations.
 * Accepts a Supabase client to support both server and browser contexts.
 */
export class FlightService {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Search available flights matching the given criteria.
   * FR-CUS-001: Search by origin, destination, date, passengers, cabin class.
   * FR-CUS-004: Cabin class filter is optional — returns all classes if omitted.
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    const { originCode, destinationCode, departureDate, passengers, cabinClass } = params;

    const dayStart = `${departureDate}T00:00:00+07:00`;
    const dayEnd   = `${departureDate}T23:59:59+07:00`;

    // Step 1: Resolve IATA codes → airport rows (with integer surrogate IDs)
    const { data: searchAirports, error: airportLookupError } = await queryAirportsByCode(
      this.supabase, [originCode, destinationCode]
    );
    if (airportLookupError) throw new Error(`Airport lookup failed: ${airportLookupError.message}`);

    const originRow = searchAirports?.find((a) => a.airport_code === originCode);
    const destRow   = searchAirports?.find((a) => a.airport_code === destinationCode);
    if (!originRow || !destRow) return { flights: [], totalCount: 0 };

    // Step 2: Search flights using integer airport IDs
    const { data: flightRows, error: flightError } = await queryFlightSearch(
      this.supabase, originRow.id, destRow.id, dayStart, dayEnd
    );
    if (flightError) throw new Error(`Flight search failed: ${flightError.message}`);
    if (!flightRows || flightRows.length === 0) return { flights: [], totalCount: 0 };

    const flightIds = flightRows.map((f) => f.id);

    // Step 3: Fetch cabin classes for all matching flights
    const { data: ccRows, error: ccError } = await queryCabinClassesByFlights(
      this.supabase, flightIds, cabinClass, passengers
    );
    if (ccError) throw new Error(`Cabin class fetch failed: ${ccError.message}`);

    // Key by stringified flight_id (integer FK → string for safe Map key)
    const ccByFlight = new Map<string, FlightCabinClassInfo[]>();
    for (const cc of ccRows ?? []) {
      const key  = String(cc.flight_id);
      const list = ccByFlight.get(key) ?? [];
      list.push(toCabinClassInfo(cc));
      ccByFlight.set(key, list);
    }

    // Step 4: Build airport map from already-resolved rows (keyed by integer id)
    const airportMap = new Map<number, Airport>(
      (searchAirports ?? []).map((a) => [a.id, toAirport(a)])
    );

    // Step 5: Assemble domain Flight objects
    const flights: Flight[] = [];
    for (const row of flightRows) {
      const ccs = ccByFlight.get(String(row.id));
      if (!ccs || ccs.length === 0) continue;

      const origin      = airportMap.get(row.origin_airport_id!);
      const destination = airportMap.get(row.destination_airport_id!);
      if (!origin || !destination) continue;

      flights.push(toFlight(row, origin, destination, ccs));
    }

    return { flights, totalCount: flights.length };
  }

  /**
   * Get a single flight by ID, including cabin class info and airport details.
   */
  async getFlightById(id: string): Promise<Flight | null> {
    // Flight IDs are stored as strings (converted from integer), parse back for DB
    const numId = parseInt(id, 10);
    const queryId = isNaN(numId) ? id : numId;

    const { data: row, error } = await queryFlightById(this.supabase, queryId);
    if (error || !row) return null;

    // Collect non-null airport integer IDs
    const airportIds = [row.origin_airport_id, row.destination_airport_id]
      .filter((v): v is number => v !== null);

    const [ccResult, airportResult] = await Promise.all([
      queryCabinClassesByFlight(this.supabase, queryId),
      queryAirports(this.supabase, airportIds),
    ]);

    if (ccResult.error) throw new Error(ccResult.error.message);
    if (airportResult.error) throw new Error(airportResult.error.message);

    const airportMap = new Map<number, Airport>(
      (airportResult.data ?? []).map((a) => [a.id, toAirport(a)])
    );

    const origin      = airportMap.get(row.origin_airport_id!);
    const destination = airportMap.get(row.destination_airport_id!);
    if (!origin || !destination) return null;

    const cabinClasses = (ccResult.data ?? []).map(toCabinClassInfo);
    return toFlight(row, origin, destination, cabinClasses);
  }

  /**
   * Get all airports (for search form autocomplete). FR-CUS-001.
   */
  async listAirports(): Promise<Airport[]> {
    const { data, error } = await queryAirportsOrdered(this.supabase);
    if (error) throw new Error(`Airport list failed: ${error.message}`);
    return (data ?? []).map(toAirport);
  }

  /**
   * List all flights (admin). FR-DASH-001.
   */
  async listFlights(): Promise<Flight[]> {
    const { data: flightRows, error: flightError } = await queryAllFlights(this.supabase);
    if (flightError) throw new Error(flightError.message);
    if (!flightRows || flightRows.length === 0) return [];

    const flightIds  = flightRows.map((f) => f.id);
    const airportIds = [
      ...new Set(
        flightRows.flatMap((f) =>
          [f.origin_airport_id, f.destination_airport_id].filter((v): v is number => v !== null)
        )
      ),
    ];

    const [ccResult, airportResult] = await Promise.all([
      queryCabinClassesByFlights(this.supabase, flightIds),
      queryAirports(this.supabase, airportIds),
    ]);

    if (ccResult.error) throw new Error(ccResult.error.message);
    if (airportResult.error) throw new Error(airportResult.error.message);

    const ccByFlight = new Map<string, FlightCabinClassInfo[]>();
    for (const cc of ccResult.data ?? []) {
      const key  = String(cc.flight_id);
      const list = ccByFlight.get(key) ?? [];
      list.push(toCabinClassInfo(cc));
      ccByFlight.set(key, list);
    }

    const airportMap = new Map<number, Airport>(
      (airportResult.data ?? []).map((a) => [a.id, toAirport(a)])
    );

    return flightRows
      .map((row) => {
        const origin      = airportMap.get(row.origin_airport_id!);
        const destination = airportMap.get(row.destination_airport_id!);
        if (!origin || !destination) return null;
        return toFlight(row, origin, destination, ccByFlight.get(String(row.id)) ?? []);
      })
      .filter((f): f is Flight => f !== null);
  }

  /**
   * Get pricing for a specific flight + cabin class.
   * Used to confirm price before payment.
   */
  async getCabinClassPrice(
    flightId: string,
    cabinClass: CabinClass
  ): Promise<{ price: number; currency: string; availableSeats: number } | null> {
    const { data, error } = await queryCabinClassPrice(
      this.supabase, flightId, cabinClass
    );
    if (error || !data) return null;
    return {
      price:          Number(data.price),
      currency:       data.currency,
      availableSeats: data.available_seats,
    };
  }
}
