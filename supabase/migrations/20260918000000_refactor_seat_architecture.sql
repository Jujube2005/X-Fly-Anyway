-- =============================================================================
-- X-Fly Anyway — Seat Architecture Refactor (Phase B Migration)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. aircraft_type
-- ---------------------------------------------------------------------------
-- Drop the existing empty table that has the wrong schema
DROP TABLE IF EXISTS aircraft_type CASCADE;

CREATE TABLE aircraft_type (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Seed base aircraft types needed for flight assignments
INSERT INTO aircraft_type (id, name) VALUES 
('A320', 'Airbus A320'), 
('B77W', 'Boeing 777-300ER') 
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. cabin_layout
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cabin_layout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aircraft_type_id TEXT NOT NULL REFERENCES aircraft_type(id) ON DELETE CASCADE,
    cabin_class TEXT NOT NULL CHECK (cabin_class IN ('economy','premium_economy','business','first')),
    UNIQUE (id, aircraft_type_id),
    UNIQUE (aircraft_type_id, cabin_class)
);

-- ---------------------------------------------------------------------------
-- 3. seat_definition
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seat_definition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cabin_layout_id UUID NOT NULL,
    aircraft_type_id TEXT NOT NULL,
    row_number INT NOT NULL,
    column_letter TEXT NOT NULL,
    seat_number TEXT NOT NULL,
    is_window BOOLEAN NOT NULL DEFAULT false,
    is_aisle BOOLEAN NOT NULL DEFAULT false,
    is_exit_row BOOLEAN NOT NULL DEFAULT false,
    
    FOREIGN KEY (cabin_layout_id, aircraft_type_id) REFERENCES cabin_layout(id, aircraft_type_id) ON DELETE CASCADE,
    
    UNIQUE (id, aircraft_type_id),
    UNIQUE (cabin_layout_id, seat_number)
);

-- ---------------------------------------------------------------------------
-- 4. flight (Updates)
-- ---------------------------------------------------------------------------
-- Apply deterministic rule
WITH first_class_flights AS (
    SELECT DISTINCT flight_id 
    FROM flight_cabin_class 
    WHERE cabin_class = 'first'
)
UPDATE flight f
SET aircraft_type_id = CASE 
    WHEN fcf.flight_id IS NOT NULL THEN 'B77W'
    ELSE 'A320'
END
FROM flight f_join
LEFT JOIN first_class_flights fcf ON f_join.id = fcf.flight_id
WHERE f.id = f_join.id;

-- Add constraints
ALTER TABLE flight ADD CONSTRAINT fk_flight_aircraft_type FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_type(id) ON DELETE RESTRICT;
ALTER TABLE flight ADD CONSTRAINT uq_flight_aircraft_type UNIQUE (id, aircraft_type_id);
ALTER TABLE flight ALTER COLUMN aircraft_type_id SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 5. flight_seat_override
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flight_seat_override (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID NOT NULL,
    seat_definition_id UUID NOT NULL,
    aircraft_type_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('held', 'blocked')),
    reason TEXT,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    FOREIGN KEY (flight_id, aircraft_type_id) REFERENCES flight(id, aircraft_type_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_definition_id, aircraft_type_id) REFERENCES seat_definition(id, aircraft_type_id) ON DELETE CASCADE,
    
    UNIQUE (flight_id, seat_definition_id)
);

-- ---------------------------------------------------------------------------
-- 6. booking_seat (Updates)
-- ---------------------------------------------------------------------------
ALTER TABLE booking_seat DROP CONSTRAINT IF EXISTS booking_seat_seat_id_fkey;
ALTER TABLE booking_seat DROP CONSTRAINT IF EXISTS booking_seat_seat_id_key;

-- We don't drop booking_seat_booking_id_seat_id_key here if its name varies, we drop it safely
ALTER TABLE booking_seat DROP CONSTRAINT IF EXISTS booking_seat_booking_id_seat_id_key;
ALTER TABLE booking_seat DROP COLUMN IF EXISTS seat_id;

ALTER TABLE booking_seat ADD COLUMN flight_id UUID NOT NULL;
ALTER TABLE booking_seat ADD COLUMN seat_definition_id UUID NOT NULL;
ALTER TABLE booking_seat ADD COLUMN aircraft_type_id TEXT NOT NULL;

ALTER TABLE booking_seat ADD CONSTRAINT fk_booking_seat_flight 
    FOREIGN KEY (flight_id, aircraft_type_id) REFERENCES flight(id, aircraft_type_id) ON DELETE CASCADE;

ALTER TABLE booking_seat ADD CONSTRAINT fk_booking_seat_definition 
    FOREIGN KEY (seat_definition_id, aircraft_type_id) REFERENCES seat_definition(id, aircraft_type_id) ON DELETE RESTRICT;

ALTER TABLE booking_seat ADD CONSTRAINT uq_booking_seat_flight_seat 
    UNIQUE (flight_id, seat_definition_id);

-- Explicitly DO NOT ADD UNIQUE(booking_id, seat_definition_id)
-- Note: Do NOT drop the `seat` table yet!
