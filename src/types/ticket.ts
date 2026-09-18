import type { CabinClass, Flight } from "./flight";
import type { Passenger } from "./passenger";
import type { Payment } from "./payment";

export interface ETicketFlight {
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  originName?: string;
  originCity?: string;
  destinationName?: string;
  destinationCity?: string;
  departureAt: string;
  arrivalAt?: string;
}

export interface ETicketSeat {
  seatNumber: string;
}

export interface ETicketBooking {
  reference: string;
  status?: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  flight: ETicketFlight | null;
  seats: ETicketSeat[];
  seatNumbers?: string[][];
  flightIds?: string[];
}

export interface ETicket {
  id: string;
  ticketCode: string;
  eTicketId?: string | null;
  bookingId: string;
  issuedAt: string;
  booking: ETicketBooking | null;
  flights?: Flight[];
  payment?: Payment | null;
}
