/** Seat domain types */

import type { CabinClass } from "./flight";
import type { SeatStatusValue } from "./database";

/**
 * Seat status at database level: available | occupied | blocked
 * "selected" is a transient UI-only state — never persisted to database.
 */
export type SeatStatus = SeatStatusValue;

/** UI-only extended status (adds "selected" for seat map display) */
export type SeatDisplayStatus = SeatStatus | "selected";

export interface Seat {
  id: string;
  flightId: string;
  seatNumber: string;   // e.g. "12A"
  rowNumber: number;
  columnLetter: string; // e.g. "A"
  cabinClass: CabinClass;
  isWindow: boolean;
  isAisle: boolean;
  isExitRow: boolean;
  status: SeatStatus;   // DB status
}

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

/**
 * Response shape for GET /api/seats.
 * Contains layout metadata and only the seats that are occupied —
 * the frontend generates the full grid from layout and overlays occupiedSeats.
 */
export interface SeatAvailabilityResponse {
  layout: SeatLayout;
  /** Seat numbers (e.g. "12A") whose status is 'occupied' or 'blocked'. */
  occupiedSeats: string[];
}

/**
 * @deprecated Use SeatAvailabilityResponse + SeatLayout instead.
 * Kept for backward compatibility while consumers are migrated.
 */
export interface SeatMap {
  flightId: string;
  cabinClass: CabinClass;
  rows: number;
  columns: string[];    // e.g. ["A","B","C","D","E","F"]
  seats: Seat[];
}

