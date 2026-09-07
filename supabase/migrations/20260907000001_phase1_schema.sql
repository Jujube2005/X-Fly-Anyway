-- =============================================================================
-- X-Fly Anyway — Phase 1 Schema
-- Migration: 20260907000001_phase1_schema.sql
--
-- Tables:
--   airport, flight, flight_cabin_class, seat,
--   booking, passenger, booking_seat, payment, e_ticket
--
-- RLS: disabled for Phase 1 (no customer auth — BR-002)
--      Admin auth enforced at application layer (proxy.ts)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. airport
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS airport (
  id           TEXT        PRIMARY KEY,             -- IATA code e.g. "BKK"
  name         TEXT        NOT NULL,
  city         TEXT        NOT NULL,
  country      TEXT        NOT NULL,                -- Full country name
  country_code TEXT        NOT NULL,                -- ISO 3166-1 alpha-2
  timezone     TEXT        NOT NULL,                -- IANA tz e.g. "Asia/Bangkok"
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. flight
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flight (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number    TEXT        NOT NULL UNIQUE,    -- e.g. "XFA001"
  origin_code      TEXT        NOT NULL REFERENCES airport(id),
  destination_code TEXT        NOT NULL REFERENCES airport(id),
  departure_at     TIMESTAMPTZ NOT NULL,
  arrival_at       TIMESTAMPTZ NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','boarding','departed','arrived','cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_flight_diff_airports   CHECK (origin_code <> destination_code),
  CONSTRAINT chk_flight_arrival_after   CHECK (arrival_at > departure_at)
);

CREATE INDEX IF NOT EXISTS idx_flight_search
  ON flight (origin_code, destination_code, departure_at);

CREATE INDEX IF NOT EXISTS idx_flight_status
  ON flight (status);

-- ---------------------------------------------------------------------------
-- 3. flight_cabin_class
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flight_cabin_class (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id       UUID        NOT NULL REFERENCES flight(id) ON DELETE CASCADE,
  cabin_class     TEXT        NOT NULL
                  CHECK (cabin_class IN ('economy','premium_economy','business','first')),
  price           NUMERIC(10,2) NOT NULL CHECK (price > 0),
  currency        TEXT        NOT NULL DEFAULT 'THB',
  total_seats     INT         NOT NULL CHECK (total_seats > 0),
  available_seats INT         NOT NULL CHECK (available_seats >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (flight_id, cabin_class),
  CONSTRAINT chk_fcc_available_lte_total CHECK (available_seats <= total_seats)
);

CREATE INDEX IF NOT EXISTS idx_fcc_flight_id
  ON flight_cabin_class (flight_id);

-- ---------------------------------------------------------------------------
-- 4. seat
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seat (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id     UUID    NOT NULL REFERENCES flight(id) ON DELETE CASCADE,
  seat_number   TEXT    NOT NULL,          -- e.g. "12A"
  row_number    INT     NOT NULL,
  column_letter TEXT    NOT NULL,          -- e.g. "A"
  cabin_class   TEXT    NOT NULL
                CHECK (cabin_class IN ('economy','premium_economy','business','first')),
  is_window     BOOLEAN NOT NULL DEFAULT false,
  is_aisle      BOOLEAN NOT NULL DEFAULT false,
  is_exit_row   BOOLEAN NOT NULL DEFAULT false,
  status        TEXT    NOT NULL DEFAULT 'available'
                CHECK (status IN ('available','occupied','blocked')),
                -- NOTE: 'selected' is transient UI state only — never persisted
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (flight_id, seat_number)
);

-- Seat map query index (FR-CUS-005: render available seats by cabin class)
CREATE INDEX IF NOT EXISTS idx_seat_map
  ON seat (flight_id, cabin_class, status);

-- ---------------------------------------------------------------------------
-- 5. booking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  reference          TEXT          NOT NULL UNIQUE,  -- "XFA-YYYYMMDD-XXXX"
  flight_id          UUID          NOT NULL REFERENCES flight(id),
  cabin_class        TEXT          NOT NULL
                     CHECK (cabin_class IN ('economy','premium_economy','business','first')),
  contact_first_name TEXT          NOT NULL,
  contact_last_name  TEXT          NOT NULL,
  contact_email      TEXT          NOT NULL,
  contact_phone      TEXT          NOT NULL,
  total_amount       NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  currency           TEXT          NOT NULL DEFAULT 'THB',
  status             TEXT          NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','cancelled','completed')),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_reference ON booking (reference);
CREATE INDEX IF NOT EXISTS idx_booking_flight    ON booking (flight_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_email     ON booking (contact_email);

-- ---------------------------------------------------------------------------
-- 6. passenger
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS passenger (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID  NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
  title           TEXT  NOT NULL CHECK (title IN ('Mr','Mrs','Ms','Master')),
  first_name      TEXT  NOT NULL,
  last_name       TEXT  NOT NULL,
  date_of_birth   DATE  NOT NULL,
  gender          TEXT  NOT NULL CHECK (gender IN ('male','female','unspecified')),
  nationality     TEXT  NOT NULL,  -- ISO 3166-1 alpha-2 — required for FR-DASH-007
  passport_number TEXT,
  passport_expiry DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passenger_booking ON passenger (booking_id);

-- ---------------------------------------------------------------------------
-- 7. booking_seat
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_seat (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
  seat_id    UUID NOT NULL REFERENCES seat(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (booking_id, seat_id),
  UNIQUE (seat_id)   -- prevents double-booking same seat (concurrency safety)
);

CREATE INDEX IF NOT EXISTS idx_booking_seat_booking ON booking_seat (booking_id);

-- ---------------------------------------------------------------------------
-- 8. payment
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID          NOT NULL REFERENCES booking(id) ON DELETE CASCADE UNIQUE,
  amount          NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency        TEXT          NOT NULL DEFAULT 'THB',
  method          TEXT          NOT NULL
                  CHECK (method IN ('credit_card','card_charge','bitcoin')),
                  -- SRS FR-CUS-010: Credit Card / Card Charge / Bitcoin
  status          TEXT          NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','success','failed','refunded')),
  transaction_ref TEXT          UNIQUE,      -- mock transaction ref
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_booking ON payment (booking_id);

-- ---------------------------------------------------------------------------
-- 9. e_ticket
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_ticket (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE UNIQUE,
  issued_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_path   TEXT,        -- nullable; future: Supabase Storage path
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger (flight + booking + payment)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_flight_updated_at
  BEFORE UPDATE ON flight
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_booking_updated_at
  BEFORE UPDATE ON booking
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_payment_updated_at
  BEFORE UPDATE ON payment
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
