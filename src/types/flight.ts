/** Flight domain types */

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface Airport {
  code: string; // IATA airport code, e.g. "BKK"
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: Airport;
  destination: Airport;
  departureAt: string; // ISO 8601
  arrivalAt: string;   // ISO 8601
  durationMinutes: number;
  cabinClasses: CabinClass[];
  status: "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
}

export interface FlightSearchParams {
  originCode: string;
  destinationCode: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD (for round-trip)
  passengers: number;
  cabinClass: CabinClass;
}

export interface FlightSearchResult {
  flights: Flight[];
  totalCount: number;
}
