import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Supabase has a default limit of 1000 rows. We need to override it to get all 6000+ airports.
    const { data: airports, error } = await supabase.from('airport').select('*').limit(7000);
    console.log("Data Airports: ", airports);

    if (error) throw error;

    return NextResponse.json({ airports });
    
  } catch (error) {
    console.error("Error fetching airports:", error);
    return NextResponse.json(
      { error: "Failed to fetch airports" },
      { status: 500 }
    );
  }
}
