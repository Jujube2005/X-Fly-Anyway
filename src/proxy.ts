import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js Proxy — refreshes Supabase session on every request
 * and enforces admin route protection.
 *
 * Note: "middleware" was renamed to "proxy" in Next.js 16.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets:
     * - _next/static   (static files)
     * - _next/image    (image optimization)
     * - favicon.ico    (favicon)
     * - public images  (.svg .png .jpg .jpeg .gif .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
