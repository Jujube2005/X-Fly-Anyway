import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCompanyDeviceIdentity } from "@/lib/auth/device-auth";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user and get role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isCompanyDeviceIdentity(user)) {
      return NextResponse.json({ error: "Forbidden: Not a company device" }, { status: 403 });
    }

    const { data: roleData } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!roleData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (roleData as any).role;

    // 2. Build Query
    let query = supabase.from("booking").select(`
      *,
      payment (method, status, amount, transaction_ref),
      flight:flight_id (flight_number, departure_time, arrival_time, status, origin:origin_airport_id(city), destination:destination_airport_id(city)),
      passenger (id, first_name, last_name, title, date_of_birth),
      booking_leg (leg_sequence, flight:flight_id(flight_number, departure_time, arrival_time, status, origin:origin_airport_id(city), destination:destination_airport_id(city)))
    `).order('created_at', { ascending: false });

    // RBAC Enforcement for Booking Management
    if (role === "flight_staff") {
      // Flight Staff only see bookings associated with their assigned flights
      const { data: assignments } = await supabase
        .from("flight_staff_assignment")
        .select("flight_id")
        .eq("staff_id", user.id);
        
      const assignedFlightIds = ((assignments as any[]) || []).map(a => a.flight_id);
      
      if (assignedFlightIds.length === 0) {
        return NextResponse.json({ bookings: [] });
      }

      // We must get bookings where booking.flight_id is in assigned OR booking_leg.flight_id is in assigned.
      const { data: legs } = await supabase
        .from("booking_leg")
        .select("booking_id")
        .in("flight_id", assignedFlightIds);
        
      const legBookingIds = ((legs as any[]) || []).map(l => l.booking_id);
      
      // Build a filter string for Supabase OR logic:
      // flight_id in (X,Y) OR id in (A,B)
      // Supabase JS .or() expects a string syntax.
      const flightIdFilter = `flight_id.in.(${assignedFlightIds.join(',')})`;
      const idFilter = legBookingIds.length > 0 ? `id.in.(${legBookingIds.join(',')})` : ``;
      
      if (idFilter) {
        query = query.or(`${flightIdFilter},${idFilter}`);
      } else {
        query = query.in("flight_id", assignedFlightIds);
      }
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("[GET /api/admin/bookings]", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
