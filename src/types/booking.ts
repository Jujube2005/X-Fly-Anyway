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
  flightId: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  contact: BookingContact;
  seatNumbers: string[];     // selected seat numbers e.g. ["12A"]
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;         // ISO 8601
  updatedAt: string;
}

export interface CreateBookingPayload {
  flightId: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  contact: BookingContact;
  seatNumbers: string[];
}

/**
 * Booking draft — stored in localStorage during the multi-step booking flow.
 * Cleared after booking is confirmed (BR-002: no customer auth/session).
 */
export interface BookingDraft {
  flightId: string;
  cabinClass: CabinClass;
  seatNumber: string;
  passengers: Partial<Passenger>[];
  contact: Partial<BookingContact>;
  pricePerSeat: number;
  currency: string;
}

