import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FlightService } from "@/lib/services/flight.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const service = new FlightService(supabase);
    const airports = await service.listAirports();
    return NextResponse.json({ airports });
  } catch (error) {
    console.error("Error fetching airports:", error);
    return NextResponse.json(
      { error: "Failed to fetch airports" },
      { status: 500 }
    );
  }
}
