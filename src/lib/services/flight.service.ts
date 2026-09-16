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
    airport_code: row.id,             // airport.id IS the IATA code
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

    // Step 1: Search flights — origin_airport_id / destination_airport_id ARE the IATA codes
    const { data: flightRows, error: flightError } = await queryFlightSearch(
      this.supabase, originCode, destinationCode, dayStart, dayEnd
    );
    if (flightError) throw new Error(`Flight search failed: ${flightError.message}`);
    if (!flightRows || flightRows.length === 0) {
      // Fallback to connecting flights if no direct flights found
      const connecting = await this.searchConnectingFlights(params);
      return { direct: [], connecting, totalCount: connecting.length };
    }

    const flightIds = flightRows.map((f) => f.id);

    // Step 2: Fetch cabin classes for all matching flights
    const { data: ccRows, error: ccError } = await queryCabinClassesByFlights(
      this.supabase, flightIds, cabinClass, passengers
    );
    if (ccError) throw new Error(`Cabin class fetch failed: ${ccError.message}`);

    // Key cabin classes by flight UUID
    const ccByFlight = new Map<string, FlightCabinClassInfo[]>();
    for (const cc of ccRows ?? []) {
      const key  = cc.flight_id;
      const list = ccByFlight.get(key) ?? [];
      list.push(toCabinClassInfo(cc));
      ccByFlight.set(key, list);
    }

    // Step 3: Fetch airport rows for origin + destination
    const { data: searchAirports, error: airportLookupError } = await queryAirportsByCode(
      this.supabase, [originCode, destinationCode]
    );
    if (airportLookupError) throw new Error(`Airport lookup failed: ${airportLookupError.message}`);

    // Airport map keyed by IATA code (= airport.id)
    const airportMap = new Map<string, Airport>(
      (searchAirports ?? []).map((a) => [a.id, toAirport(a)])
    );

    // Step 4: Assemble domain Flight objects
    const flights: Flight[] = [];
    for (const row of flightRows) {
      const ccs = ccByFlight.get(row.id);
      if (!ccs || ccs.length === 0) continue;

      const origin      = airportMap.get(row.origin_airport_id!);
      const destination = airportMap.get(row.destination_airport_id!);
      if (!origin || !destination) continue;

      flights.push(toFlight(row, origin, destination, ccs));
    }

    return { direct: flights, connecting: [], totalCount: flights.length };
  }

  /**
   * Search for connecting flights with exactly 1 stop.
   * Rules:
   * - 45m <= layover <= 8h
   * - Same cabin class with enough seats on both legs
   * - Same hub airport
   */
  private async searchConnectingFlights(params: FlightSearchParams): Promise<import("@/types/flight").ConnectingFlight[]> {
    const { originCode, destinationCode, departureDate, passengers, cabinClass } = params;
    
    // We need the new queries from queries.ts
    const { queryFlightsByOrigin, queryFlightsByDestination } = await import("@/lib/supabase/queries");

    const dayStart = `${departureDate}T00:00:00+07:00`;
    const dayEnd   = `${departureDate}T23:59:59+07:00`;

    // 1. Fetch all possible Leg 1 flights from origin
    const { data: leg1Rows, error: leg1Error } = await queryFlightsByOrigin(
      this.supabase, originCode, dayStart, dayEnd
    );
    if (leg1Error) throw new Error(`Leg 1 search failed: ${leg1Error.message}`);
    if (!leg1Rows || leg1Rows.length === 0) return [];

    // Optimize: Find min and max arrival times of Leg 1 to scope Leg 2 search
    // Min departure of Leg 2 is min arrival of Leg 1 + 45 minutes
    // Max departure of Leg 2 is max arrival of Leg 1 + 8 hours
    let minArr = new Date("2100-01-01").getTime();
    let maxArr = 0;
    for (const r of leg1Rows) {
      const arr = new Date(r.arrival_time).getTime();
      if (arr < minArr) minArr = arr;
      if (arr > maxArr) maxArr = arr;
    }
    
    const minDepLeg2 = new Date(minArr + 45 * 60000).toISOString();
    const maxDepLeg2 = new Date(maxArr + 8 * 3600000).toISOString();

    // 2. Fetch all possible Leg 2 flights to destination within the time window
    const { data: leg2Rows, error: leg2Error } = await queryFlightsByDestination(
      this.supabase, destinationCode, minDepLeg2, maxDepLeg2
    );
    if (leg2Error) throw new Error(`Leg 2 search failed: ${leg2Error.message}`);
    if (!leg2Rows || leg2Rows.length === 0) return [];

    // 3. Match pairs and validate layover rules
    const validPairs: { leg1: FlightRow, leg2: FlightRow, layoverMins: number }[] = [];
    for (const l1 of leg1Rows) {
      if (!l1.destination_airport_id) continue;
      
      const arrMs = new Date(l1.arrival_time).getTime();
      
      for (const l2 of leg2Rows) {
        // Hub must match
        if (l2.origin_airport_id !== l1.destination_airport_id) continue;
        
        const depMs = new Date(l2.departure_time).getTime();
        const layoverMins = Math.round((depMs - arrMs) / 60000);
        
        // 45 mins <= layover <= 8 hours
        if (layoverMins >= 45 && layoverMins <= 480) {
          validPairs.push({ leg1: l1, leg2: l2, layoverMins });
        }
      }
    }
    if (validPairs.length === 0) return [];

    // 4. Gather unique flight IDs to fetch cabin classes
    const uniqueFlightIds = new Set<string>();
    validPairs.forEach(p => {
      uniqueFlightIds.add(p.leg1.id);
      uniqueFlightIds.add(p.leg2.id);
    });

    const { data: ccRows, error: ccError } = await queryCabinClassesByFlights(
      this.supabase, Array.from(uniqueFlightIds), cabinClass, passengers
    );
    if (ccError) throw new Error(`Cabin class fetch failed: ${ccError.message}`);

    const ccByFlightAndClass = new Map<string, FlightCabinClassRow>();
    for (const cc of ccRows ?? []) {
      ccByFlightAndClass.set(`${cc.flight_id}-${cc.cabin_class}`, cc);
    }

    // 5. Filter pairs that share the SAME cabin class with enough seats on BOTH legs
    // Since cabinClass filter could be optional, we must find any class that is valid on both
    const validClasses = cabinClass ? [cabinClass] : ["economy", "premium_economy", "business", "first"];
    
    const fullyValidPairs: {
      leg1: FlightRow,
      leg2: FlightRow,
      layoverMins: number,
      cabinClass: CabinClass,
      totalPrice: number,
      cc1: FlightCabinClassInfo,
      cc2: FlightCabinClassInfo
    }[] = [];

    for (const pair of validPairs) {
      for (const ccName of validClasses) {
        const cc1 = ccByFlightAndClass.get(`${pair.leg1.id}-${ccName}`);
        const cc2 = ccByFlightAndClass.get(`${pair.leg2.id}-${ccName}`);
        
        if (cc1 && cc2 && cc1.available_seats >= passengers && cc2.available_seats >= passengers) {
          fullyValidPairs.push({
            leg1: pair.leg1,
            leg2: pair.leg2,
            layoverMins: pair.layoverMins,
            cabinClass: ccName as CabinClass,
            totalPrice: Number(cc1.price) + Number(cc2.price),
            cc1: toCabinClassInfo(cc1),
            cc2: toCabinClassInfo(cc2),
          });
        }
      }
    }
    if (fullyValidPairs.length === 0) return [];

    // 6. Gather all unique airports for mapping
    const airportIds = new Set<string>();
    airportIds.add(originCode);
    airportIds.add(destinationCode);
    fullyValidPairs.forEach(p => airportIds.add(p.leg1.destination_airport_id!));
    
    const { data: searchAirports } = await queryAirportsByCode(
      this.supabase, Array.from(airportIds)
    );
    const airportMap = new Map<string, Airport>(
      (searchAirports ?? []).map((a) => [a.id, toAirport(a)])
    );

    // 7. Assemble connecting flights
    const connectingFlights: import("@/types/flight").ConnectingFlight[] = [];
    for (const match of fullyValidPairs) {
      const origin = airportMap.get(originCode)!;
      const hub = airportMap.get(match.leg1.destination_airport_id!)!;
      const dest = airportMap.get(destinationCode)!;

      const flight1 = toFlight(match.leg1, origin, hub, [match.cc1]);
      const flight2 = toFlight(match.leg2, hub, dest, [match.cc2]);
      const totalDurationMins = flight1.durationMinutes + match.layoverMins + flight2.durationMinutes;

      connectingFlights.push({
        type: 'connecting',
        legs: [flight1, flight2],
        via: hub,
        layoverMinutes: match.layoverMins,
        totalDurationMinutes: totalDurationMins,
        totalPrice: match.totalPrice,
        cabinClass: match.cabinClass,
      });
    }

    // Sort by price, then by duration
    connectingFlights.sort((a, b) => {
      if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
      return a.totalDurationMinutes - b.totalDurationMinutes;
    });

    return connectingFlights;
  }

  /**
   * Get a single flight by ID, including cabin class info and airport details.
   */
  async getFlightById(id: string): Promise<Flight | null> {
    const { data: row, error } = await queryFlightById(this.supabase, id);
    if (error || !row) return null;

    // Collect non-null airport IATA codes
    const airportCodes = [row.origin_airport_id, row.destination_airport_id]
      .filter((v): v is string => v !== null);

    const [ccResult, airportResult] = await Promise.all([
      queryCabinClassesByFlight(this.supabase, id),
      queryAirports(this.supabase, airportCodes),
    ]);

    if (ccResult.error) throw new Error(ccResult.error.message);
    if (airportResult.error) throw new Error(airportResult.error.message);

    // Airport map keyed by IATA code
    const airportMap = new Map<string, Airport>(
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
    // origin_airport_id / destination_airport_id are TEXT IATA codes
    const airportCodes = [
      ...new Set(
        flightRows.flatMap((f) =>
          [f.origin_airport_id, f.destination_airport_id].filter((v): v is string => v !== null)
        )
      ),
    ];

    const [ccResult, airportResult] = await Promise.all([
      queryCabinClassesByFlights(this.supabase, flightIds),
      queryAirports(this.supabase, airportCodes),
    ]);

    if (ccResult.error) throw new Error(ccResult.error.message);
    if (airportResult.error) throw new Error(airportResult.error.message);

    const ccByFlight = new Map<string, FlightCabinClassInfo[]>();
    for (const cc of ccResult.data ?? []) {
      const key  = cc.flight_id;
      const list = ccByFlight.get(key) ?? [];
      list.push(toCabinClassInfo(cc));
      ccByFlight.set(key, list);
    }

    // Airport map keyed by IATA code
    const airportMap = new Map<string, Airport>(
      (airportResult.data ?? []).map((a) => [a.id, toAirport(a)])
    );

    return flightRows
      .map((row) => {
        const origin      = airportMap.get(row.origin_airport_id!);
        const destination = airportMap.get(row.destination_airport_id!);
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
