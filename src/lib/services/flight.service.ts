import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  Flight,
  FlightSearchParams,
  FlightSearchResult,
} from "@/types/flight";

/**
 * FlightService — all flight-related database operations.
 * Accepts a Supabase client to support both server and browser contexts.
 */
export class FlightService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Search available flights matching the given criteria */
  async searchFlights(
    _params: FlightSearchParams
  ): Promise<FlightSearchResult> {
    // TODO: implement flight search query
    throw new Error("FlightService.searchFlights — not yet implemented");
  }

  /** Get a single flight by ID */
  async getFlightById(_id: string): Promise<Flight | null> {
    // TODO: implement single flight query
    throw new Error("FlightService.getFlightById — not yet implemented");
  }

  /** List all flights (admin) */
  async listFlights(): Promise<Flight[]> {
    // TODO: implement admin flight list query
    throw new Error("FlightService.listFlights — not yet implemented");
  }
}
