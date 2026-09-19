import { NextResponse } from "next/server";
import { validateExternalToken } from "@/lib/auth/external-auth";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateExternalToken(request, "read:manifest");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabaseAdmin } = authResult;
    const { id } = await props.params;

    // 1. Fetch Flight Details
    const { data: flightData, error: flightError } = await supabaseAdmin
      .from("flight")
      .select(`
        id, 
        flight_number, 
        departure_time, 
        arrival_time,
        origin:airport!origin_airport_id (id, city),
        destination:airport!destination_airport_id (id, city)
      `)
      .eq("id", id)
      .single();

    const flight = flightData as any;

    if (flightError || !flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // 2. Fetch Passengers & Bookings
    // Using booking_leg -> booking -> passenger -> booking_seat -> seat_definition
    // We can fetch booking_legs for this flight, then join the rest.
    const { data: legsData, error: legsError } = await supabaseAdmin
      .from("booking_leg")
      .select(`
        booking_id,
        booking (
          reference,
          status,
          cabin_class,
          passenger (
            id,
            first_name,
            last_name
          ),
          booking_seat (
            flight_id,
            seat_definition (
              seat_number
            )
          )
        )
      `)
      .eq("flight_id", id);
      
    const legs = legsData as any[];

    if (legsError) {
      console.error("[GET /api/external/v1/flights/[id]/manifest] Legs Error:", legsError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const passengersList: any[] = [];

    // Safely map the returned structured data
    for (const leg of legs || []) {
      const b = Array.isArray(leg.booking) ? leg.booking[0] : leg.booking;
      if (!b) continue;

      // Extract the seat for this specific flight
      const bookingSeats = Array.isArray(b.booking_seat) ? b.booking_seat : (b.booking_seat ? [b.booking_seat] : []);
      const flightSeat = bookingSeats.find((bs: any) => bs.flight_id === id);
      const seatNumber = flightSeat?.seat_definition?.seat_number || null;

      const pxs = Array.isArray(b.passenger) ? b.passenger : (b.passenger ? [b.passenger] : []);
      for (const p of pxs) {
        passengersList.push({
          booking_reference: b.reference,
          first_name: p.first_name,
          last_name: p.last_name,
          seat_number: seatNumber,
          cabin_class: b.cabin_class,
          status: b.status
        });
      }
    }

    return NextResponse.json({
      flight: {
        id: flight.id,
        flight_number: flight.flight_number,
        origin: {
          code: (flight.origin as any)?.id || "",
          city: (flight.origin as any)?.city || ""
        },
        destination: {
          code: (flight.destination as any)?.id || "",
          city: (flight.destination as any)?.city || ""
        },
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time
      },
      passengers: passengersList
    });

  } catch (error) {
    console.error("[GET /api/external/v1/flights/[id]/manifest]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
