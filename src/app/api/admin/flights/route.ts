import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user and get role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // RBAC Enforcement for Flight Management
    if (role === "booking_staff") {
      return NextResponse.json({ error: "Forbidden: Booking staff cannot access flight management" }, { status: 403 });
    }

    // 2. Fetch flights based on role
    let query = supabase.from("flight").select(`
      *,
      origin:airport!origin_airport_id (name, city, airport_code:id),
      destination:airport!destination_airport_id (name, city, airport_code:id),
      aircraft:aircraft_type_id (name)
    `).order('departure_time', { ascending: false });

    if (role === "flight_staff") {
      // Flight Staff only see assigned flights
      const { data: assignments } = await supabase
        .from("flight_staff_assignment")
        .select("flight_id")
        .eq("staff_id", user.id);
        
      const assignedFlightIds = ((assignments as any[]) || []).map(a => a.flight_id);
      
      if (assignedFlightIds.length === 0) {
        return NextResponse.json({ flights: [] });
      }
      
      query = query.in("id", assignedFlightIds);
    }

    const { data: flights, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({ flights });
  } catch (error: any) {
    console.error("[GET /api/admin/flights]", error);
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user and get role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: roleData } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (roleData as any)?.role;

    // RBAC: super_admin or flight_staff can create flights
    if (role !== "super_admin" && role !== "flight_staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    
    // Basic validation (In a real app, use Zod)
    if (!body.flight_number || !body.departure_time || !body.arrival_time) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert flight
    const { data: flight, error: insertError } = await supabase
      .from("flight")
      .insert({
        flight_number: body.flight_number,
        origin_airport_id: body.origin_airport_id,
        destination_airport_id: body.destination_airport_id,
        aircraft_type_id: body.aircraft_type_id,
        departure_time: body.departure_time,
        arrival_time: body.arrival_time,
        status: body.status || "scheduled"
      } as any)
      .select()
      .single();

    if (insertError) throw insertError;

    // If flight_staff, immediately assign them to the new flight
    if (role === "flight_staff") {
      const { error: assignError } = await supabase
        .from("flight_staff_assignment")
        .insert({
          staff_id: user.id,
          flight_id: (flight as any).id
        } as any);
        
      if (assignError) {
        console.error("Failed to auto-assign new flight to staff", assignError);
      }
    }

    return NextResponse.json({ flight }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/flights]", error);
    return NextResponse.json({ error: "Failed to create flight" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: roleData } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (roleData as any)?.role;
    if (role !== "super_admin" && role !== "flight_staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const flightId = body.id;
    
    if (!flightId) return NextResponse.json({ error: "Flight ID is required" }, { status: 400 });

    // If flight_staff, verify assignment
    if (role === "flight_staff") {
      const { data: assignment } = await supabase
        .from("flight_staff_assignment")
        .select("flight_id")
        .eq("staff_id", user.id)
        .eq("flight_id", flightId)
        .single();
        
      if (!assignment) {
        return NextResponse.json({ error: "Forbidden: Not assigned to this flight" }, { status: 403 });
      }
    }

    const { data: flight, error: updateError } = await supabase
      .from("flight")
      .update({
        flight_number: body.flight_number,
        origin_airport_id: body.origin_airport_id,
        destination_airport_id: body.destination_airport_id,
        aircraft_type_id: body.aircraft_type_id,
        departure_time: body.departure_time,
        arrival_time: body.arrival_time,
        status: body.status
      } as never)
      .eq("id", flightId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ flight });
  } catch (error: any) {
    console.error("[PUT /api/admin/flights]", error);
    return NextResponse.json({ error: "Failed to update flight" }, { status: 500 });
  }
}
