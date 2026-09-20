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
      return NextResponse.json({ error: "Forbidden: Flight staff cannot access bookings" }, { status: 403 });
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
