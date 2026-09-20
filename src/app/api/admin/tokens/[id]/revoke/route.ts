import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCompanyDeviceIdentity } from "@/lib/auth/device-auth";

async function authorizeSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (!isCompanyDeviceIdentity(user)) {
    return null;
  }

  const { data: roleData } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!roleData || (roleData as any).role !== "super_admin") {
    return null;
  }
  return supabase;
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const supabase = await authorizeSuperAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  try {
    const params = await props.params;
    const { id } = params;

    const { error } = await supabase
      .from("external_api_tokens")
      .update({ is_revoked: true } as never)
      .eq("id", id);

    if (error) {
      console.error("[POST /api/admin/tokens/[id]/revoke]", error);
      return NextResponse.json({ error: "Failed to revoke token" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/tokens/[id]/revoke]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
