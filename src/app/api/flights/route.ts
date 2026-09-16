import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FlightService } from "@/lib/services/flight.service";
import type { FlightSearchParams } from "@/types/flight";
import type { CabinClass } from "@/types/flight";

/**
 * GET /api/flights
 *
 * Search available flights.
 * FR-CUS-001: Search by origin, destination, date, passengers, cabin class.
 *
 * Query params:
 *   origin       — IATA code (required)
 *   destination  — IATA code (required)
 *   date         — YYYY-MM-DD (required)
 *   passengers   — integer ≥ 1 (required)
 *   cabinClass   — economy | premium_economy | business | first (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const origin      = searchParams.get("origin")?.trim().toUpperCase();
  const destination = searchParams.get("destination")?.trim().toUpperCase();
  const date        = searchParams.get("date")?.trim();
  const passengerRaw = searchParams.get("passengers");
  const cabinClass  = searchParams.get("cabinClass") as CabinClass | null;
  const tripType    = (searchParams.get("tripType") as 'one_way' | 'round_trip') || 'one_way';

  // Validate required parameters
  if (!origin || !destination || !date || !passengerRaw) {
    return Response.json(
      {
        error: "Missing required parameters: origin, destination, date, passengers",
      },
      { status: 400 }
    );
  }

  const passengers = parseInt(passengerRaw, 10);
  if (isNaN(passengers) || passengers < 1 || passengers > 9) {
    return Response.json(
      { error: "passengers must be a number between 1 and 9" },
      { status: 400 }
    );
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "date must be in YYYY-MM-DD format" },
      { status: 400 }
    );
  }

  const validCabinClasses: CabinClass[] = [
    "economy",
    "premium_economy",
    "business",
    "first",
  ];
  if (cabinClass && !validCabinClasses.includes(cabinClass)) {
    return Response.json(
      { error: `Invalid cabinClass. Must be one of: ${validCabinClasses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const service = new FlightService(supabase);

    const params: FlightSearchParams = {
      originCode:      origin,
      destinationCode: destination,
      departureDate:   date,
      passengers,
      cabinClass:      cabinClass ?? undefined,
      tripType,
    };

    const result = await service.searchFlights(params);

    return Response.json(result);
  } catch (err: any) {
    console.error("[GET /api/flights]", err);
    return Response.json(
      { error: "Failed to search flights. Please try again.", details: err.message },
      { status: 500 }
    );
  }
}
