import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DashboardStats, RevenueByPeriod } from "@/types/admin";

/**
 * AdminService — admin-specific reporting and statistics operations.
 * All methods require an authenticated admin Supabase client.
 */
export class AdminService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Get dashboard summary statistics */
  async getDashboardStats(): Promise<DashboardStats> {
    // TODO: implement dashboard stats aggregation
    throw new Error("AdminService.getDashboardStats — not yet implemented");
  }

  /** Get revenue grouped by month */
  async getRevenueByMonth(
    _year: number
  ): Promise<RevenueByPeriod[]> {
    // TODO: implement revenue aggregation
    throw new Error("AdminService.getRevenueByMonth — not yet implemented");
  }
}
