import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { z } from "zod";

const createTokenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scopes: z.array(z.string()).min(1, "At least one scope is required"),
});

/**
 * Ensures the current user is a super_admin.
 * Returns the supabase client if authorized, or null.
 */
async function authorizeSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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

export async function GET() {
  const supabase = await authorizeSuperAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  // Fetch tokens without sensitive hashes
  const { data, error } = await supabase
    .from("external_api_tokens")
    .select("id, name, scopes, expires_at, is_revoked, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/admin/tokens]", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }

  return NextResponse.json({ tokens: data });
}

export async function POST(request: Request) {
  const supabase = await authorizeSuperAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parseResult = createTokenSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { name, scopes } = parseResult.data;

    // Validate scopes
    const allowedScopes = ["read:manifest"];
    const invalidScopes = scopes.filter(s => !allowedScopes.includes(s));
    if (invalidScopes.length > 0) {
      return NextResponse.json({ error: `Unsupported scopes: ${invalidScopes.join(", ")}` }, { status: 400 });
    }

    // Generate cryptographically secure tokens
    const rawAccessToken = crypto.randomBytes(32).toString('hex');
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');

    // Hash tokens for storage
    const accessTokenHash = crypto.createHash('sha256').update(rawAccessToken).digest('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    // 1-hour expiration
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    // 30-day refresh absolute expiration
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("external_api_tokens")
      .insert({
        name,
        token_hash: accessTokenHash,
        refresh_token_hash: refreshTokenHash,
        scopes,
        expires_at: expiresAt,
        refresh_expires_at: refreshExpiresAt,
        is_revoked: false
      } as any)
      .select("id, name, scopes, expires_at, created_at")
      .single();

    if (error) {
      console.error("[POST /api/admin/tokens]", error);
      return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
    }

    // Return the raw tokens EXACTLY ONCE
    return NextResponse.json({
      token: data,
      rawAccessToken,
      rawRefreshToken
    });
  } catch (error) {
    console.error("[POST /api/admin/tokens]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
