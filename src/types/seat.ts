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

export interface SeatMap {
  flightId: string;
  cabinClass: CabinClass;
  rows: number;
  columns: string[];    // e.g. ["A","B","C","D","E","F"]
  seats: Seat[];
}

