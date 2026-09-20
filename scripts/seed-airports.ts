import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import countries from 'i18n-iso-countries';

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

async function seedAirports() {
    console.log("Starting to prepare airport data...");
    const csvPath = path.join(process.cwd(), 'data', 'airports.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split("\n");
    const airportsToInsert = [];

    for (const line of lines) {
        if (!line.trim()) continue;

        const columns = line.split(',');

        const iataCode = columns[4]?.replace(/"/g, '');

        if (!iataCode || iataCode === '\\N' || iataCode.length !== 3) continue;

        const name = columns[1]?.replace(/"/g, '');
        const city = columns[2]?.replace(/"/g, '');
        const countryName = columns[3]?.replace(/"/g, '');
        const timezone = columns[11]?.replace(/"/g, '');

        const countryCode = countries.getAlpha2Code(countryName, 'en') || 'XX';

        const airportData = {
            airport_code: iataCode,
            name: name,
            city: city,
            country: countryName,
            country_code: countryCode,
            timezone: timezone
        };
        airportsToInsert.push(airportData);
    }

    console.log(`${airportsToInsert.length} airports`);
    console.log("Ex. first 2 airports: ", airportsToInsert.slice(0, 2));
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
        console.error("not find supabase url or key !");
        return;
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const BATCH_SIZE = 500;
    console.log(`\n  ${airportsToInsert.length} airports...`);
    for (let i = 0; i < airportsToInsert.length; i += BATCH_SIZE) {
        const batch = airportsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('airport').insert(batch);

        if (error) {
            console.error(`error ${i}:`, error.message);
        } else {
            console.log(`upload successfully ${i + batch.length} / ${airportsToInsert.length} airports`);
        }
    }
    console.log("Done!");

}

seedAirports();




