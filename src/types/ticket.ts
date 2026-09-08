/** E-Ticket domain types */

import type { CabinClass } from "./flight";
import type { Passenger } from "./passenger";

export interface ETicketFlight {
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureAt: string;
}

export interface ETicketSeat {
  seatNumber: string;
}

export interface ETicketBooking {
  reference: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  flight: ETicketFlight | null;
  seats: ETicketSeat[];
}

export interface ETicket {
  id: string;
  ticketCode: string;
  bookingId: string;
  issuedAt: string;
  booking: ETicketBooking | null;
}
