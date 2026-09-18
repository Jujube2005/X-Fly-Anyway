import type { CabinClass } from "./flight";
import type { SeatStatusValue } from "./database";

/**
 * Seat status at database level: available | occupied | blocked | held
 */
export type SeatStatus = SeatStatusValue | "held";

/** UI-only extended status (adds "selected" for seat map display) */
export type SeatDisplayStatus = SeatStatus | "selected";

/**
 * Layout metadata derived from the seat table for a given flight + cabin class.
 * Sent from the backend so the frontend can render the seat grid without
 * receiving the full set of available seat objects.
 */
export interface SeatLayout {
  flightId: string;
  cabinClass: CabinClass;
  firstRow: number;   // MIN(row_number) for this cabin class
  lastRow: number;    // MAX(row_number) for this cabin class
  rows: number;       // lastRow - firstRow + 1
  columns: string[];  // Distinct, sorted column letters e.g. ["A","B","C","D","E","F"]
}

export interface SeatInfo {
  status: SeatStatus;
  rowNumber: number;
  columnLetter: string;
  isWindow: boolean;
  isAisle: boolean;
  isExitRow: boolean;
  priceModifier: number;
}

/**
 * Standardized response shape for GET /api/seats.
 */
export interface SeatAvailabilityResponse {
  flightId: string;
  aircraftType: string;
  cabinClass: CabinClass;
  layout?: SeatLayout; // Optional layout metadata for UI grid rendering
  seatsInfo: Record<string, SeatInfo>;
}
