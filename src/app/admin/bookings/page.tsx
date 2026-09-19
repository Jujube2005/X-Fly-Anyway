"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/States";

interface Booking {
  id: string;
  reference: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  passenger: { first_name: string; last_name: string }[];
  flight: { flight_number: string; origin: { city: string }; destination: { city: string } };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then(async res => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch bookings");
        setBookings(json.bookings || []);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const fmtCurrency = (amt: number, curr: string) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: curr }).format(amt);

  return (
    <div className="flex flex-col gap-6 py-2 pb-12">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-[#f3f4f6]">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Booking Management</h1>
          <p className="text-sm text-[#6b7280] font-medium mt-1">View and manage customer bookings</p>
        </div>
      </div>

      {isLoading && <div className="mt-12"><LoadingState message="Loading bookings..." /></div>}
      
      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-sm font-semibold flex items-center gap-3">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#f3f4f6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] text-[#6b7280] font-semibold">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Passenger</th>
                  <th className="px-6 py-4">Flight Route</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#111827]">{b.reference}</td>
                    <td className="px-6 py-4 text-[#6b7280]">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {b.passenger?.[0] ? `${b.passenger[0].first_name} ${b.passenger[0].last_name}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[#6b7280]">
                      {b.flight ? (
                        <>
                          <span className="font-bold text-[#111827]">{b.flight.flight_number}</span>
                          <br/>
                          <span className="text-xs">{b.flight.origin?.city} → {b.flight.destination?.city}</span>
                        </>
                      ) : (
                        "Connecting / Multi-leg"
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111827]">
                      {fmtCurrency(b.total_amount, b.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#9ca3af] font-medium">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
