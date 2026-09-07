import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SeatService } from "@/lib/services/seat.service";
import type { CabinClass } from "@/types/flight";

/**
 * GET /api/seats
 *
 * Get the seat map for a specific flight and cabin class.
 * FR-CUS-005: Display seat map with available/occupied status.
 *
 * Query params:
 *   flightId    — UUID (required)
 *   cabinClass  — economy | premium_economy | business | first (required)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const flightId  = searchParams.get("flightId")?.trim();
  const cabinClass = searchParams.get("cabinClass") as CabinClass | null;

  if (!flightId || !cabinClass) {
    return Response.json(
      { error: "Missing required parameters: flightId, cabinClass" },
      { status: 400 }
    );
  }

  const validClasses: CabinClass[] = [
    "economy",
    "premium_economy",
    "business",
    "first",
  ];
  if (!validClasses.includes(cabinClass)) {
    return Response.json(
      { error: `Invalid cabinClass. Must be one of: ${validClasses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const service = new SeatService(supabase);
    const seatMap = await service.getSeatMap(flightId, cabinClass);

    if (!seatMap) {
      return Response.json(
        { error: "Seat map not found for this flight and cabin class." },
        { status: 404 }
      );
    }

    return Response.json({ seatMap });
  } catch (err) {
    console.error("[GET /api/seats]", err);
    return Response.json(
      { error: "Failed to fetch seat map." },
      { status: 500 }
    );
  }
}
