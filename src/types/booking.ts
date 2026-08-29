/** Booking domain types */

import type { CabinClass } from "./flight";
import type { Passenger } from "./passenger";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface BookingContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  reference: string; // e.g. "XFA-20260829-ABC1"
  flightId: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  contact: BookingContact;
  seatNumbers: string[];
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface CreateBookingPayload {
  flightId: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  contact: BookingContact;
  seatNumbers: string[];
}
