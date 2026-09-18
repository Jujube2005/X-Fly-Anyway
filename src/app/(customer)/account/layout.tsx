import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <Link
              href="/account"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/account/bookings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/account/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Profile
            </Link>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
              >
                Log out
              </button>
            </form>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
