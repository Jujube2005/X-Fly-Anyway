import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: airports, error } = await supabase.from('airport').select('*');
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
