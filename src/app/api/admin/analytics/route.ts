import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AdminService } from "@/lib/services/admin.service";
import { z } from "zod";

const querySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
});

/**
 * GET /api/admin/analytics
 * 
 * Returns aggregated analytics data for the admin dashboard.
 * Requires Super Admin access (currently proxy.ts enforces /admin/* route protection).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = querySchema.safeParse({
      period: searchParams.get("period") || "monthly",
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid period parameter. Must be daily, weekly, or monthly." },
        { status: 400 }
      );
    }

    const { period } = parseResult.data;

    const supabase = await createClient();
    const adminService = new AdminService(supabase);
    
    const analyticsData = await adminService.getAnalytics(period);

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
