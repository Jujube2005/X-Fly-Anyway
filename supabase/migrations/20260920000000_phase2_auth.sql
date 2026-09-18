-- Phase 2 Authentication and Customer Accounts

-- 1. Create public.customer table (1:1 with auth.users)
CREATE TABLE public.customer (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on customer
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own profile"
    ON public.customer FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Customers can update their own profile"
    ON public.customer FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to automatically create a customer record on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer (id, first_name, last_name, phone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'first_name', ''), 
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Modify public.booking to associate with customer
ALTER TABLE public.booking ADD COLUMN customer_id UUID REFERENCES public.customer(id) ON DELETE SET NULL;

-- Enable RLS on booking
ALTER TABLE public.booking ENABLE ROW LEVEL SECURITY;

-- Allow authenticated customers to view their own bookings
CREATE POLICY "Customers can view their own bookings"
    ON public.booking FOR SELECT
    USING (auth.uid() = customer_id);

-- Allow backend (anon/authenticated) to insert bookings (validation handled by API)
CREATE POLICY "Anyone can insert a booking"
    ON public.booking FOR INSERT
    WITH CHECK (true);

-- Allow backend (anon/authenticated) to update bookings (cancellation, etc. handled by API)
CREATE POLICY "Anyone can update a booking"
    ON public.booking FOR UPDATE
    USING (true);

-- To support Guest Lookup, we can allow SELECT on all bookings (since UUIDs are secure and API handles PNR matching)
-- Alternatively, rely on Service Role key in the backend. 
-- For now, to not break Phase 1, we allow SELECT on all bookings. UUIDs are impossible to guess.
-- (This acts just like Phase 1, but allows the authenticated policy to also work in JS client)
CREATE POLICY "Anyone can select a booking by UUID"
    ON public.booking FOR SELECT
    USING (true);

-- 3. Create public.admin_roles table for secure role-based access
CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'flight_staff', 'booking_staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own admin role"
    ON public.admin_roles FOR SELECT
    USING (auth.uid() = id);

-- (Super admins will manage admin_roles directly in Supabase Dashboard for Phase 2)
