"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/States";

interface Booking {
  id: string;
  reference: string;
  total_amount: number;
  currency: string;
  status: string;
  cabin_class: string;
  created_at: string;
  passenger: { first_name: string; last_name: string; title: string; date_of_birth: string }[];
  payment?: { method: string; status: string; amount: number }[];
  flight?: { flight_number: string; departure_time: string; arrival_time: string; origin: { city: string }; destination: { city: string } };
  booking_leg?: { leg_sequence: number; flight: { flight_number: string; departure_time: string; arrival_time: string; origin: { city: string }; destination: { city: string } } }[];
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
    <div className="flex flex-col gap-6 py-2 pb-12 relative">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-[#f3f4f6]">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Booking Management</h1>
          <p className="text-sm text-[#6b7280] font-medium mt-1">View and manage customer bookings</p>
        </div>
        <a 
          href="/admin/dashboard"
          className="bg-[#f3f4f6] text-[#374151] px-6 py-2 rounded-xl font-bold hover:bg-[#e5e7eb] transition-colors"
        >
          ← Back to Dashboard
        </a>
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
                  <th className="px-6 py-4">Action</th>
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
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedBooking(b)}
                        className="bg-[#f3f4f6] text-[#374151] px-4 py-1.5 rounded-lg font-bold hover:bg-[#e5e7eb] transition-colors text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#9ca3af] font-medium">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#111827]">Booking Details</h2>
                <p className="text-[#6b7280] font-medium mt-1">Ref: {selectedBooking.reference}</p>
              </div>
              <div className="flex items-center gap-4">
                {selectedBooking.status === "confirmed" && (
                  <a 
                    href={`/ticket/${selectedBooking.reference}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#111827] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-sm"
                  >
                    View E-Ticket
                  </a>
                )}
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="text-[#9ca3af] hover:text-[#111827] text-2xl font-bold p-2 leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-[#f9fafb] p-4 rounded-2xl">
                <p className="text-xs font-bold text-[#6b7280] uppercase mb-1">Status</p>
                <p className="font-bold text-[#111827] capitalize">{selectedBooking.status}</p>
              </div>
              <div className="bg-[#f9fafb] p-4 rounded-2xl">
                <p className="text-xs font-bold text-[#6b7280] uppercase mb-1">Cabin Class</p>
                <p className="font-bold text-[#111827] capitalize">{selectedBooking.cabin_class}</p>
              </div>
              <div className="bg-[#f9fafb] p-4 rounded-2xl">
                <p className="text-xs font-bold text-[#6b7280] uppercase mb-1">Payment Status</p>
                <p className="font-bold text-[#111827] capitalize">{selectedBooking.payment?.[0]?.status || "N/A"} ({selectedBooking.payment?.[0]?.method || "N/A"})</p>
              </div>
              <div className="bg-[#f9fafb] p-4 rounded-2xl">
                <p className="text-xs font-bold text-[#6b7280] uppercase mb-1">Total Amount</p>
                <p className="font-bold text-[#111827]">{fmtCurrency(selectedBooking.total_amount, selectedBooking.currency)}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#111827] mb-4 border-b pb-2">Passenger Information</h3>
            <div className="flex flex-col gap-3 mb-8">
              {selectedBooking.passenger?.map((p, i) => (
                <div key={i} className="flex gap-4 items-center bg-[#f9fafb] p-3 rounded-xl border border-[#f3f4f6]">
                  <div className="w-10 h-10 bg-[#e5e7eb] rounded-full flex items-center justify-center font-bold text-[#6b7280]">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">{p.title} {p.first_name} {p.last_name}</p>
                    <p className="text-xs text-[#6b7280] font-medium">DOB: {new Date(p.date_of_birth).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-[#111827] mb-4 border-b pb-2">Itinerary</h3>
            <div className="flex flex-col gap-4">
              {selectedBooking.flight ? (
                <div className="bg-[#f9fafb] p-4 rounded-2xl border border-[#f3f4f6]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-[#f5c800]">{selectedBooking.flight.flight_number}</span>
                    <span className="text-xs font-bold text-[#6b7280] uppercase">Direct Flight</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-[#111827]">{selectedBooking.flight.origin?.city}</p>
                      <p className="text-sm text-[#6b7280]">{new Date(selectedBooking.flight.departure_time).toLocaleString()}</p>
                    </div>
                    <div className="text-[#9ca3af]">✈️</div>
                    <div className="flex-1 text-right">
                      <p className="text-lg font-bold text-[#111827]">{selectedBooking.flight.destination?.city}</p>
                      <p className="text-sm text-[#6b7280]">{new Date(selectedBooking.flight.arrival_time).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : selectedBooking.booking_leg?.length ? (
                selectedBooking.booking_leg.sort((a,b)=>a.leg_sequence - b.leg_sequence).map((leg, i) => (
                  <div key={i} className="bg-[#f9fafb] p-4 rounded-2xl border border-[#f3f4f6]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-[#f5c800]">{leg.flight.flight_number}</span>
                      <span className="text-xs font-bold text-[#6b7280] uppercase">Leg {leg.leg_sequence}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-[#111827]">{leg.flight.origin?.city}</p>
                        <p className="text-sm text-[#6b7280]">{new Date(leg.flight.departure_time).toLocaleString()}</p>
                      </div>
                      <div className="text-[#9ca3af]">✈️</div>
                      <div className="flex-1 text-right">
                        <p className="text-lg font-bold text-[#111827]">{leg.flight.destination?.city}</p>
                        <p className="text-sm text-[#6b7280]">{new Date(leg.flight.arrival_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#6b7280] italic">No itinerary details available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
