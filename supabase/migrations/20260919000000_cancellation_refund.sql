-- =============================================================================
-- X-Fly Anyway — Cancellation & Full Refund Schema
-- Migration: 20260919000000_cancellation_refund.sql
-- SRS: FR-CUS-015, FR-CUS-016, FR-CUS-017, AC-004
-- =============================================================================

-- 1. Create cancellation table
CREATE TABLE IF NOT EXISTS cancellation (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID          NOT NULL REFERENCES booking(id) ON DELETE CASCADE UNIQUE,
    reason          TEXT          NULL,
    refund_amount   NUMERIC(10,2) NOT NULL CHECK (refund_amount >= 0),
    refund_currency TEXT          NOT NULL DEFAULT 'THB',
    refund_status   TEXT          NOT NULL DEFAULT 'completed'
                    CHECK (refund_status IN ('pending', 'completed', 'failed')),
    refund_channel  TEXT          NOT NULL,
    cancelled_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cancellation_booking ON cancellation(booking_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_date ON cancellation(cancelled_at);

-- 2. Add refunded_at to payment table if not present
ALTER TABLE payment ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ NULL;

-- 3. Enable RLS and public policies for cancellation
ALTER TABLE cancellation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read/insert cancellation" ON cancellation;
CREATE POLICY "Public read/insert cancellation"
  ON cancellation FOR ALL
  USING (true)
  WITH CHECK (true);
