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
  queryAirportsOrdered,
} from "@/lib/supabase/queries";


// ─── Row → Domain mappers ───────────────────────────────────────────────────

function toAirport(row: AirportRow): Airport {
  return {
    airport_code: row.id,
    name:         row.name,
    city:         row.city,
    country:      row.country,
    country_code: row.country_code,
    timezone:     row.timezone,
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
    new Date(row.arrival_at).getTime() - new Date(row.departure_at).getTime();

  return {
    id:              row.id,
    flightNumber:    row.flight_number,
    origin,
    destination,
    departureAt:     row.departure_at,
    arrivalAt:       row.arrival_at,
    durationMinutes: Math.round(durationMs / 60_000),
    cabinClasses,
    status:          row.status,
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

    const { data: flightRows, error: flightError } = await queryFlightSearch(
      this.supabase, originCode, destinationCode, dayStart, dayEnd
    );

    if (flightError) throw new Error(`Flight search failed: ${flightError.message}`);
    if (!flightRows || flightRows.length === 0) return { flights: [], totalCount: 0 };

    const flightIds = flightRows.map((f) => f.id);

    const { data: ccRows, error: ccError } = await queryCabinClassesByFlights(
      this.supabase, flightIds, cabinClass, passengers
    );
    if (ccError) throw new Error(`Cabin class fetch failed: ${ccError.message}`);

    const ccByFlight = new Map<string, FlightCabinClassInfo[]>();
    for (const cc of ccRows ?? []) {
      const list = ccByFlight.get(cc.flight_id) ?? [];
      list.push(toCabinClassInfo(cc));
      ccByFlight.set(cc.flight_id, list);
    }

    const airportCodes = [
      ...new Set(flightRows.flatMap((f) => [f.origin_code, f.destination_code])),
    ];

    const { data: airportRows, error: airportError } = await queryAirports(
      this.supabase, airportCodes
    );
    if (airportError) throw new Error(`Airport fetch failed: ${airportError.message}`);

    const airportMap = new Map<string, Airport>(
      (airportRows ?? []).map((a) => [a.id, toAirport(a)])
    );

    const flights: Flight[] = [];
    for (const row of flightRows) {
      const ccs = ccByFlight.get(row.id);
      if (!ccs || ccs.length === 0) continue;

      const origin = airportMap.get(row.origin_code);
      const destination = airportMap.get(row.destination_code);
      if (!origin || !destination) continue;

      flights.push(toFlight(row, origin, destination, ccs));
    }

    return { flights, totalCount: flights.length };
  }

  /**
   * Get a single flight by ID, including cabin class info and airport details.
   */
  async getFlightById(id: string): Promise<Flight | null> {
    const { data: row, error } = await queryFlightById(this.supabase, id);
    if (error || !row) return null;

    const [ccResult, airportResult] = await Promise.all([
      queryCabinClassesByFlight(this.supabase, id),
      queryAirports(this.supabase, [row.origin_code, row.destination_code]),
    ]);

    if (ccResult.error) throw new Error(ccResult.error.message);
    if (airportResult.error) throw new Error(airportResult.error.message);

    const airportMap = new Map<string, Airport>(
      (airportResult.data ?? []).map((a) => [a.id, toAirport(a)])
    );

    const origin = airportMap.get(row.origin_code);
    const destination = airportMap.get(row.destination_code);
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

    const flightIds = flightRows.map((f) => f.id);
    const airportCodes = [
      ...new Set(flightRows.flatMap((f) => [f.origin_code, f.destination_code])),
    ];

    const [ccResult, airportResult] = await Promise.all([
      queryCabinClassesByFlights(this.supabase, flightIds),
      queryAirports(this.supabase, airportCodes),
    ]);

    if (ccResult.error) throw new Error(ccResult.error.message);
    if (airportResult.error) throw new Error(airportResult.error.message);

    const ccByFlight = new Map<string, FlightCabinClassInfo[]>();
    for (const cc of ccResult.data ?? []) {
      const list = ccByFlight.get(cc.flight_id) ?? [];
      list.push(toCabinClassInfo(cc));
      ccByFlight.set(cc.flight_id, list);
    }

    const airportMap = new Map<string, Airport>(
      (airportResult.data ?? []).map((a) => [a.id, toAirport(a)])
    );

    return flightRows
      .map((row) => {
        const origin = airportMap.get(row.origin_code);
        const destination = airportMap.get(row.destination_code);
        if (!origin || !destination) return null;
        return toFlight(row, origin, destination, ccByFlight.get(row.id) ?? []);
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
