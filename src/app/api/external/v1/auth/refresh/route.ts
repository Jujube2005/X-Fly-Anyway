import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json({ error: "refresh_token is required" }, { status: 400 });
    }

    // Hash the provided refresh token to look it up
    const refreshTokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');

    // Using admin-level supabase client to bypass RLS for external API verification
    // because this route is unauthenticated by Next.js auth.
    // It authenticates via the refresh token.
    const supabase = await createClient();
    
    // Actually, createClient from @/lib/supabase/server uses user's cookies. 
    // This is a B2B API, so there are no cookies. RLS will block if we don't use service role.
    // Let's use the service role key for DB access since we verified the hash.
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tokenRecord, error } = await supabaseAdmin
      .from("external_api_tokens")
      .select("*")
      .eq("refresh_token_hash", refreshTokenHash)
      .single();

    if (error || !tokenRecord) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    if (tokenRecord.is_revoked) {
      return NextResponse.json({ error: "Token has been revoked" }, { status: 401 });
    }

    if (new Date(tokenRecord.refresh_expires_at) < new Date()) {
      return NextResponse.json({ error: "Refresh token has expired" }, { status: 401 });
    }

    // Generate new Access Token
    const newRawAccessToken = crypto.randomBytes(32).toString('hex');
    const newAccessTokenHash = crypto.createHash('sha256').update(newRawAccessToken).digest('hex');
    
    // Generate new Refresh Token (rotating refresh token)
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');

    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("external_api_tokens")
      .update({
        token_hash: newAccessTokenHash,
        refresh_token_hash: newRefreshTokenHash,
        expires_at: newExpiresAt,
      } as never)
      .eq("id", tokenRecord.id);

    if (updateError) {
      console.error("[POST /api/external/v1/auth/refresh] Update Error", updateError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({
      access_token: newRawAccessToken,
      refresh_token: newRawRefreshToken,
      expires_at: newExpiresAt,
      token_type: "Bearer"
    });

  } catch (error) {
    console.error("[POST /api/external/v1/auth/refresh]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
