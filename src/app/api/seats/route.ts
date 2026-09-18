import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SeatService } from "@/lib/services/seat.service";
import type { CabinClass } from "@/types/flight";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const flightId   = searchParams.get("flightId")?.trim();
  const cabinParam = (searchParams.get("cabin") ?? searchParams.get("cabinClass"))?.trim();
  const cabinClass = cabinParam as CabinClass | null;

  if (!flightId || !cabinClass) {
    return Response.json(
      { error: "Missing required parameters: flightId, cabin" },
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
      { error: `Invalid cabin. Must be one of: ${validClasses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const service  = new SeatService(supabase);
    const result   = await service.getLayoutAndOccupied(flightId, cabinClass);

    if (!result) {
      return Response.json(
        { error: "No seat data found for this flight and cabin class." },
        { status: 404 }
      );
    }

    return Response.json(result);
  } catch (err) {
    console.error("[GET /api/seats]", err);
    return Response.json(
      { error: "Failed to fetch seat layout." },
      { status: 500 }
    );
  }
}
