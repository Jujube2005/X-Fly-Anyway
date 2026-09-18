import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AccountDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.first_name || "Guest";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Bookings</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>View and manage your upcoming flights.</p>
            </div>
            <div className="mt-5">
              <Link
                href="/account/bookings"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-yellow-900 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:text-sm transition-colors"
              >
                View Bookings
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Settings</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your contact information.</p>
            </div>
            <div className="mt-5">
              <Link
                href="/account/profile"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
