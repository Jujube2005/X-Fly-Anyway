/** Booking domain types */

import type { CabinClass } from "./flight";
import type { Passenger } from "./passenger";
import type { BookingStatusValue } from "./database";

export type BookingStatus = BookingStatusValue;

export interface BookingContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  reference: string;         // e.g. "XFA-20260907-A1B2"
  flightIds: string[];       // 1 for direct, 2 for connecting
  cabinClass: CabinClass;
  passengers: Passenger[];
  contact: BookingContact;
  seatNumbers: string[][];   // per leg, e.g. [["12A"], ["14B"]]
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;         // ISO 8601
  updatedAt: string;
}

export interface CreateBookingPayload {
  flightIds: string[];
  cabinClass: CabinClass;
  passengers: Passenger[];
  contact: BookingContact;
  seatNumbers: string[][];
}

/**
 * Booking draft — stored in localStorage during the multi-step booking flow.
 * Cleared after booking is confirmed (BR-002: no customer auth/session).
 */
export interface BookingDraft {
  flightIds: string[];
  cabinClass: CabinClass;
  seatNumbers: string[][];
  passengers: Partial<Passenger>[];
  contact: Partial<BookingContact>;
  pricePerSeat: number;
  currency: string;
}

