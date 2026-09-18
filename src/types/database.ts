/**
 * Database types for X-Fly Anyway — Phase 1 Schema
 *
 * These types reflect the actual Supabase/PostgreSQL schema defined in
 * supabase/migrations/20260907000001_phase1_schema.sql
 *
 * To regenerate from Supabase CLI (after applying migration):
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enum types ────────────────────────────────────────────────────────────

export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "arrived"
  | "cancelled";

export type CabinClassValue =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

export type SeatStatusValue = "available" | "occupied" | "blocked";

export type BookingStatusValue =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

/** SRS FR-CUS-010: Credit Card / Card Charge / Bitcoin */
export type PaymentMethodValue = "credit_card" | "card_charge" | "bitcoin";

export type PaymentStatusValue = "pending" | "success" | "failed" | "refunded";

export type PassengerTitleValue = "Mr" | "Mrs" | "Ms" | "Master";

export type GenderValue = "male" | "female" | "unspecified";

// ─── Table row types ────────────────────────────────────────────────────────

export interface AirportRow {
  id: string;               // TEXT PRIMARY KEY — IATA code e.g. "BKK"
  name: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null; // ISO 3166-1 alpha-2
  timezone: string | null;     // IANA timezone e.g. "Asia/Bangkok"
  created_at: string;
}

export interface FlightRow {
  id: string;                         // UUID PRIMARY KEY
  flight_number: string;
  origin_airport_id: string | null;      // FK → airport.id (TEXT / IATA code)
  destination_airport_id: string | null; // FK → airport.id (TEXT / IATA code)
  aircraft_type_id: string | null;
  departure_time: string;             // ISO 8601 with timezone
  arrival_time: string;               // ISO 8601 with timezone
  status: FlightStatus;
  created_at: string;
  updated_at: string;
}

export interface FlightCabinClassRow {
  id: string;              // UUID PRIMARY KEY
  flight_id: string;       // FK → flight.id
  cabin_class: CabinClassValue;
  price: number;           // CHECK (price > 0)
  currency: string;        // default "THB"
  total_seats: number;     // CHECK (total_seats > 0)
  available_seats: number; // CHECK (available_seats >= 0 AND <= total_seats)
  created_at: string;
}

export interface AircraftTypeRow {
  id: string; // TEXT PRIMARY KEY
  name: string;
}

export interface CabinLayoutRow {
  id: string;
  aircraft_type_id: string;
  cabin_class: CabinClassValue;
}

export interface SeatDefinitionRow {
  id: string;
  cabin_layout_id: string;
  aircraft_type_id: string;
  row_number: number;
  column_letter: string;
  seat_number: string;
  is_window: boolean;
  is_aisle: boolean;
  is_exit_row: boolean;
}

export interface FlightSeatOverrideRow {
  id: string;
  flight_id: string;
  seat_definition_id: string;
  aircraft_type_id: string;
  status: "held" | "blocked";
  reason: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface SeatRow {
  id: string;            // UUID PRIMARY KEY
  flight_id: string;     // FK → flight.id
  seat_number: string;   // e.g. "12A" — UNIQUE per flight
  row_number: number;
  column_letter: string; // e.g. "A"
  cabin_class: CabinClassValue;
  is_window: boolean;
  is_aisle: boolean;
  is_exit_row: boolean;
  status: SeatStatusValue; // available | occupied | blocked (NOT "selected" — transient UI only)
  created_at: string;
}

export interface BookingRow {
  id: string;                  // UUID PRIMARY KEY
  customer_id: string | null;  // UUID FK to customer
  reference: string;           // e.g. "XFA-20260907-A1B2" — UNIQUE
  flight_id: string | null;    // FK → flight.id (nullable for connecting flights)
  cabin_class: CabinClassValue;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  total_amount: number;        // CHECK (total_amount >= 0)
  currency: string;            // default "THB"
  status: BookingStatusValue;  // default "pending"
  created_at: string;
  updated_at: string;
}

export interface BookingLegRow {
  id: string;                  // UUID PRIMARY KEY
  booking_id: string;          // FK → booking.id
  flight_id: string;           // FK → flight.id
  leg_sequence: number;
  created_at: string;
}

export interface PassengerRow {
  id: string;                  // UUID PRIMARY KEY
  booking_id: string;          // FK → booking.id
  title: PassengerTitleValue;
  first_name: string;
  last_name: string;
  date_of_birth: string;       // YYYY-MM-DD
  gender: GenderValue;
  nationality: string;         // ISO 3166-1 alpha-2 — required for FR-DASH-007
  passport_number: string | null;
  passport_expiry: string | null; // YYYY-MM-DD
  created_at: string;
}

export interface BookingSeatRow {
  id: string;         // UUID PRIMARY KEY
  booking_id: string; // FK → booking.id
  flight_id: string;
  seat_definition_id: string;
  aircraft_type_id: string;
  created_at: string;
}

export interface PaymentRow {
  id: string;                  // UUID PRIMARY KEY
  booking_id: string;          // FK → booking.id — UNIQUE: one payment per booking
  amount: number;              // CHECK (amount >= 0)
  currency: string;            // default "THB"
  method: PaymentMethodValue;  // credit_card | card_charge | bitcoin
  status: PaymentStatusValue;  // default "pending"
  transaction_ref: string | null; // mock transaction reference — UNIQUE when set
  paid_at: string | null;      // ISO 8601
  refunded_at: string | null;  // ISO 8601
  created_at: string;
  updated_at: string;
}

export type RefundStatusValue = "pending" | "completed" | "failed";

export interface CancellationRow {
  id: string;                  // UUID PRIMARY KEY
  booking_id: string;          // FK → booking.id — UNIQUE
  reason: string | null;
  refund_amount: number;       // CHECK (refund_amount >= 0)
  refund_currency: string;     // default "THB"
  refund_status: RefundStatusValue;
  refund_channel: string;      // e.g. "credit_card", "card_charge", "bitcoin"
  cancelled_at: string;        // ISO 8601
}

export interface ETicketRow {
  id: string;           // UUID PRIMARY KEY
  booking_id: string;   // FK → booking.id — UNIQUE
  issued_at: string;    // ISO 8601
  pdf_path: string | null; // future: Supabase Storage path
  created_at: string;
}

// ─── Insert types (omit server-generated fields) ───────────────────────────

export type AirportInsert = Omit<AirportRow, "created_at">;

export type FlightInsert = Omit<FlightRow, "created_at" | "updated_at"> & {
  id?: string;
  aircraft_type_id?: string | null;
};

export type FlightCabinClassInsert = Omit<FlightCabinClassRow, "created_at"> & {
  id?: string;
};

export type SeatInsert = Omit<SeatRow, "created_at"> & { id?: string };

export type BookingInsert = Omit<BookingRow, "created_at" | "updated_at"> & {
  id?: string;
};

export type BookingLegInsert = Omit<BookingLegRow, "created_at"> & { id?: string };

export type PassengerInsert = Omit<PassengerRow, "created_at"> & { id?: string };

export type BookingSeatInsert = Omit<BookingSeatRow, "created_at"> & { id?: string };

export type PaymentInsert = Omit<PaymentRow, "created_at" | "updated_at"> & {
  id?: string;
};

export type CancellationInsert = Omit<CancellationRow, "id" | "cancelled_at"> & {
  id?: string;
  cancelled_at?: string;
};

export type ETicketInsert = Omit<ETicketRow, "created_at"> & { id?: string };

// ─── Supabase Database interface ────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      airport: {
        Row: AirportRow;
        Insert: AirportInsert;
        Update: Partial<AirportInsert>;
      };
      flight: {
        Row: FlightRow;
        Insert: FlightInsert;
        Update: Partial<FlightInsert>;
      };
      flight_cabin_class: {
        Row: FlightCabinClassRow;
        Insert: FlightCabinClassInsert;
        Update: Partial<FlightCabinClassInsert>;
      };
      seat: {
        Row: SeatRow;
        Insert: SeatInsert;
        Update: Partial<SeatInsert>;
      };
      booking: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: Partial<BookingInsert>;
      };
      booking_leg: {
        Row: BookingLegRow;
        Insert: BookingLegInsert;
        Update: Partial<BookingLegInsert>;
      };
      passenger: {
        Row: PassengerRow;
        Insert: PassengerInsert;
        Update: Partial<PassengerInsert>;
      };
      booking_seat: {
        Row: BookingSeatRow;
        Insert: BookingSeatInsert;
        Update: Partial<BookingSeatInsert>;
      };
      payment: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: Partial<PaymentInsert>;
      };
      cancellation: {
        Row: CancellationRow;
        Insert: CancellationInsert;
        Update: Partial<CancellationInsert>;
      };
      e_ticket: {
        Row: ETicketRow;
        Insert: ETicketInsert;
        Update: Partial<ETicketInsert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      flight_status: FlightStatus;
      cabin_class: CabinClassValue;
      seat_status: SeatStatusValue;
      booking_status: BookingStatusValue;
      payment_method: PaymentMethodValue;
      payment_status: PaymentStatusValue;
    };
  };
}
