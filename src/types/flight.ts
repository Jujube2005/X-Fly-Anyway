/** Flight domain types */

import type { CabinClassValue, FlightStatus } from "./database";

/** Cabin class — reuses database enum for consistency */
export type CabinClass = CabinClassValue;
// "economy" | "premium_economy" | "business" | "first"

export interface Airport {
  code: string;         // IATA airport code e.g. "BKK"
  name: string;
  city: string;
  country: string;
  countryCode: string;  // ISO 3166-1 alpha-2
  timezone: string;     // IANA timezone e.g. "Asia/Bangkok"
}

export interface FlightCabinClassInfo {
  cabinClass: CabinClass;
  price: number;
  currency: string;
  totalSeats: number;
  availableSeats: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureAt: string;        // ISO 8601
  arrivalAt: string;          // ISO 8601
  durationMinutes: number;    // computed: (arrivalAt - departureAt)
  cabinClasses: FlightCabinClassInfo[];
  status: FlightStatus;
}

export interface FlightSearchParams {
  originCode: string;
  destinationCode: string;
  departureDate: string; // YYYY-MM-DD
  passengers: number;
  cabinClass?: CabinClass; // optional filter — customer can filter post-search (FR-CUS-004)
}

export interface FlightSearchResult {
  flights: Flight[];
  totalCount: number;
}

