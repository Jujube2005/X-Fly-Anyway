"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/States";

interface Flight {
  id: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  origin: { name: string; city: string; airport_code: string };
  destination: { name: string; city: string; airport_code: string };
  aircraft?: { name: string };
}

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState({
    flight_number: "",
    origin_airport_id: "",
    destination_airport_id: "",
    aircraft_type_id: "B738", // default placeholder
    departure_time: "",
    arrival_time: "",
    status: "scheduled"
  });

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/flights");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch flights");
      setFlights(json.flights || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleOpenModal = (flight?: Flight) => {
    if (flight) {
      setEditingFlight(flight);
      setFormData({
        flight_number: flight.flight_number,
        origin_airport_id: flight.origin?.airport_code || "",
        destination_airport_id: flight.destination?.airport_code || "",
        aircraft_type_id: "B738", // Simplified for now since we don't return aircraft_type_id directly
        departure_time: flight.departure_time.slice(0, 16), // datetime-local format
        arrival_time: flight.arrival_time.slice(0, 16),
        status: flight.status
      });
    } else {
      setEditingFlight(null);
      setFormData({
        flight_number: "",
        origin_airport_id: "",
        destination_airport_id: "",
        aircraft_type_id: "B738",
        departure_time: "",
        arrival_time: "",
        status: "scheduled"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/flights";
      const method = editingFlight ? "PUT" : "POST";
      const body = editingFlight ? { ...formData, id: editingFlight.id } : formData;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          departure_time: new Date(body.departure_time).toISOString(),
          arrival_time: new Date(body.arrival_time).toISOString(),
        })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save flight");
      
      setIsModalOpen(false);
      fetchFlights();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2 pb-12">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-[#f3f4f6]">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Flight Management</h1>
          <p className="text-sm text-[#6b7280] font-medium mt-1">Manage schedules and status</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#f5c800] text-[#111827] px-6 py-2 rounded-xl font-bold hover:bg-[#e0b600] transition-colors"
        >
          + Add Flight
        </button>
      </div>

      {isLoading && <div className="mt-12"><LoadingState message="Loading flights..." /></div>}
      
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
                  <th className="px-6 py-4">Flight</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Departure</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#111827]">{f.flight_number}</td>
                    <td className="px-6 py-4">
                      {f.origin?.airport_code} → {f.destination?.airport_code}
                    </td>
                    <td className="px-6 py-4 text-[#6b7280]">
                      {new Date(f.departure_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        f.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        f.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenModal(f)}
                        className="text-sm font-bold text-[#3b82f6] hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {flights.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#9ca3af] font-medium">
                      No flights found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[#111827] mb-6">
              {editingFlight ? "Edit Flight" : "Add New Flight"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Flight Number</label>
                <input required type="text" value={formData.flight_number} onChange={e => setFormData({...formData, flight_number: e.target.value})} className="w-full px-4 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Origin (IATA)</label>
                  <input required type="text" value={formData.origin_airport_id} onChange={e => setFormData({...formData, origin_airport_id: e.target.value})} className="w-full px-4 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Destination</label>
                  <input required type="text" value={formData.destination_airport_id} onChange={e => setFormData({...formData, destination_airport_id: e.target.value})} className="w-full px-4 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Departure Time</label>
                <input required type="datetime-local" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} className="w-full px-4 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Arrival Time</label>
                <input required type="datetime-local" value={formData.arrival_time} onChange={e => setFormData({...formData, arrival_time: e.target.value})} className="w-full px-4 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]">
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-[#6b7280] hover:bg-[#f3f4f6]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-bold bg-[#111827] text-white hover:bg-black">Save Flight</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
