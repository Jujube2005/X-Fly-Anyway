/** Seat domain types */

import type { CabinClass } from "./flight";

export type SeatStatus = "available" | "occupied" | "selected" | "blocked";

export interface Seat {
  id: string;
  flightId: string;
  seatNumber: string; // e.g. "12A"
  row: number;
  column: string;     // e.g. "A"
  cabinClass: CabinClass;
  status: SeatStatus;
  isWindow: boolean;
  isAisle: boolean;
  isExitRow: boolean;
  extraLegroom: boolean;
}

export interface SeatMap {
  flightId: string;
  cabinClass: CabinClass;
  rows: number;
  columns: string[];   // e.g. ["A", "B", "C", "D", "E", "F"]
  seats: Seat[];
}
