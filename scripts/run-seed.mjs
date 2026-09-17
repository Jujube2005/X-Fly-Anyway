import fs from 'fs';
import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("ERROR: DATABASE_URL is not set in .env.local");
  console.error("Please add your Supabase connection string (URI) to .env.local");
  console.error("Format: DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@.../postgres");
  process.exit(1);
}

const sql = postgres(dbUrl, { max: 1 });

async function main() {
  try {
    console.log("Reading seed_generated.sql (14MB)...");
    const seedData = fs.readFileSync('supabase/seed_generated.sql', 'utf8');

    console.log("Executing query directly on Postgres database...");
    
    // We execute the raw string. postgres.js can run multiple statements in one go.
    await sql.unsafe(seedData);

    console.log("Seed data imported successfully!");
  } catch (err) {
    console.error("Error executing seed:", err);
  } finally {
    await sql.end();
  }
}

main();
