-- =============================================================================
-- Migration: 20260920010000_revert_customer_auth.sql
-- Description: Safely remove obsolete Customer Authentication structures.
-- Keeps public.admin_roles intact for Admin Auth.
-- =============================================================================

-- 1. Drop trigger and function for auto customer creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop RLS policies on public.booking related to customer_id
DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.booking;

-- 3. Remove customer_id from public.booking
ALTER TABLE public.booking DROP COLUMN IF EXISTS customer_id;

-- 4. Drop RLS policies on public.customer
DROP POLICY IF EXISTS "Customers can view their own profile" ON public.customer;
DROP POLICY IF EXISTS "Customers can update their own profile" ON public.customer;

-- 5. Drop public.customer table
DROP TABLE IF EXISTS public.customer CASCADE;
