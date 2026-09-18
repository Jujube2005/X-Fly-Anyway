import fs from 'fs';
import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(dbUrl, { max: 1 });

async function main() {
  try {
    const migrationFile = process.argv[2] || 'supabase/migrations/20260919000000_cancellation_refund.sql';
    console.log(`Running migration: ${migrationFile}`);
    const migrationSql = fs.readFileSync(migrationFile, 'utf8');

    await sql.unsafe(migrationSql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
