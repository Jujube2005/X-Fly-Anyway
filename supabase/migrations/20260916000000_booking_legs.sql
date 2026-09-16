-- Migration: Add booking_leg table for connecting flights

-- 1. Create booking_leg table
CREATE TABLE booking_leg (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    flight_id UUID NOT NULL REFERENCES flight(id),
    leg_sequence INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (booking_id, leg_sequence)
);

-- 2. Migrate existing data (for backward compatibility)
INSERT INTO booking_leg (booking_id, flight_id, leg_sequence)
SELECT id, flight_id, 1 FROM booking WHERE flight_id IS NOT NULL;

-- 3. Make flight_id nullable in booking to allow connecting flights
ALTER TABLE booking ALTER COLUMN flight_id DROP NOT NULL;

-- 4. Enable RLS on the new table
ALTER TABLE booking_leg ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/insert booking_leg"
  ON booking_leg FOR ALL
  USING (true)
  WITH CHECK (true);
