import { createClient } from "@/lib/supabase/server";
import { FlightService } from "@/lib/services/flight.service";

/**
 * GET /api/flights/[id]
 *
 * Get a single flight by UUID, including cabin classes and airport info.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "Flight ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const service = new FlightService(supabase);
    const flight = await service.getFlightById(id);

    if (!flight) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    return Response.json({ flight });
  } catch (err) {
    console.error("[GET /api/flights/[id]]", err);
    return Response.json(
      { error: "Failed to fetch flight." },
      { status: 500 }
    );
  }
}
