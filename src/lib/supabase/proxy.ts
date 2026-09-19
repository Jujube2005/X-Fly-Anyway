import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * updateSession — refreshes the Supabase session token in proxy.
 * Must be called from Next.js proxy (proxy.ts) to keep the session alive.
 *
 * Note: renamed from "middleware" to "proxy" convention in Next.js 16.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — required to keep the user logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all /admin routes except /admin/login
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
