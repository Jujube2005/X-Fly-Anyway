import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AdminService } from "@/lib/services/admin.service";
import { z } from "zod";

const querySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
  destination: z.string().optional(),
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
      destination: searchParams.get("destination") || undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid period parameter. Must be daily, weekly, or monthly." },
        { status: 400 }
      );
    }

    const { period, destination } = parseResult.data;

    const supabase = await createClient();
    
    // 1. Authenticate user and get role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: roleData } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!roleData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (roleData as any).role;

    // RBAC: Booking staff are denied access to Dashboard Analytics
    if (role === "booking_staff") {
      return NextResponse.json({ error: "Forbidden: Booking staff cannot access analytics" }, { status: 403 });
    }

    const adminService = new AdminService(supabase);
    
    // Pass period, role, userId, and destination for scoping
    const analyticsData = await adminService.getAnalytics(period, role, user.id, destination);

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
