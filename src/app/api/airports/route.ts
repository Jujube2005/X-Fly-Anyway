import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    let allAirports: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;

    while (hasMore) {
      const { data, error } = await supabase
        .from('airport')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allAirports = [...allAirports, ...data];
        page++;
      } else {
        hasMore = false;
      }
    }

    return NextResponse.json({ airports: allAirports });
    
  } catch (error) {
    console.error("Error fetching airports:", error);
    return NextResponse.json(
      { error: "Failed to fetch airports" },
      { status: 500 }
    );
  }
}
