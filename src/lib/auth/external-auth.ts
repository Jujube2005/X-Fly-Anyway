import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function validateExternalToken(request: Request, requiredScope: string) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { errorResponse: NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { errorResponse: NextResponse.json({ error: "Missing Bearer token" }, { status: 401 }) };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Use service role client to bypass RLS since external B2B clients don't have Next.js user cookies
  const supabaseAdmin = createServiceRoleClient();

  const { data, error } = await supabaseAdmin
    .from("external_api_tokens")
    .select("id, name, scopes, expires_at, is_revoked")
    .eq("token_hash", tokenHash)
    .single();

  const tokenRecord = data as any;

  if (error || !tokenRecord) {
    return { errorResponse: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  if (tokenRecord.is_revoked) {
    return { errorResponse: NextResponse.json({ error: "Token has been revoked" }, { status: 401 }) };
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { errorResponse: NextResponse.json({ error: "Token has expired" }, { status: 401 }) };
  }

  if (!tokenRecord.scopes.includes(requiredScope)) {
    return { errorResponse: NextResponse.json({ error: "Forbidden: Missing required scope" }, { status: 403 }) };
  }

  return { token: tokenRecord, supabaseAdmin };
}
