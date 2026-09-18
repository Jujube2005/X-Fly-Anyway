import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";
import type { BookingRow } from "@/types/database";

export default async function AccountBookingsPage() {
  const supabase = await createClient();
  
  // RLS will automatically filter bookings by customer_id = auth.uid()
  const { data: bookings, error } = await supabase
    .from("booking")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load bookings:", error);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
        {!bookings || bookings.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't made any flight reservations yet.</p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                Book a Flight
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking: BookingRow) => (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-yellow-600 truncate">
                      {booking.booking_reference}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Date: {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.total_amount)}
                    </p>
                    <p className={`mt-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Link
                      href={`/manage?pnr=${booking.booking_reference}&lastName=${booking.contact_last_name}`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
