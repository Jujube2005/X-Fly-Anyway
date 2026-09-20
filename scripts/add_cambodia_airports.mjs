import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://evolttrxtpbfiiomhpze.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b2x0dHJ4dHBiZmlpb21ocHplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3MTExOSwiZXhwIjoyMTAzNTQ3MTE5fQ.N8cHO4-_VfA7UKXWDmvCtXiX4YjwMc-Npgqla7kb7ME';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAirports() {
  const airports = [
    {
      id: "PNH",
      name: "Phnom Penh International Airport",
      city: "Phnom Penh",
      country: "Cambodia",
      country_code: "KH",
      timezone: "Asia/Phnom_Penh"
    },
    {
      id: "REP",
      name: "Siem Reap International Airport",
      city: "Siem Reap",
      country: "Cambodia",
      country_code: "KH",
      timezone: "Asia/Phnom_Penh"
    }
  ];

  const { data, error } = await supabase.from("airport").upsert(airports);

  if (error) {
    console.error("Error inserting airports with 'id':", error.message);
    console.log("Retrying with 'airport_code'...");
    
    const alternateAirports = airports.map(a => {
        const { id, ...rest } = a;
        return { airport_code: id, ...rest };
    });
    const { error: error2 } = await supabase.from("airport").upsert(alternateAirports);
    if (error2) {
        console.error("Error inserting with 'airport_code':", error2.message);
    } else {
        console.log("Airports added successfully using 'airport_code'");
    }
  } else {
    console.log("Airports added successfully using 'id'");
  }
}

addAirports();
