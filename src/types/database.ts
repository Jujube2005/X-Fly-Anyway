/**
 * Database type stub — replace with generated types from Supabase CLI
 * once the database schema is created.
 *
 * Run: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
