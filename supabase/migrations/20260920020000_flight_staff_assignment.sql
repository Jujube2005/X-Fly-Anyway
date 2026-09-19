-- =============================================================================
-- Migration: 20260920020000_flight_staff_assignment.sql
-- Description: Create flight_staff_assignment table to map Flight Staff to Flights.
-- =============================================================================

CREATE TABLE public.flight_staff_assignment (
    staff_id UUID REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES public.flight(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (staff_id, flight_id)
);

-- Index for querying flights by staff efficiently
CREATE INDEX idx_flight_staff_assignment_staff_id ON public.flight_staff_assignment(staff_id);

-- Enable RLS
ALTER TABLE public.flight_staff_assignment ENABLE ROW LEVEL SECURITY;

-- Allow super_admin to manage assignments (Even though no UI is built yet, it is good practice for the DB schema to be secure)
CREATE POLICY "Super admins can manage flight staff assignments"
    ON public.flight_staff_assignment
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Allow staff to view their own assignments
CREATE POLICY "Staff can view their own assignments"
    ON public.flight_staff_assignment FOR SELECT
    USING (staff_id = auth.uid());
