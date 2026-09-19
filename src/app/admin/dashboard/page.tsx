"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/States";
import type { AnalyticsResponse } from "@/types/admin";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./page.css";

function StatCard({ title, value, subtitle, highlight = false }: { title: string; value: string; subtitle?: string; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-3xl p-6 admin-card flex flex-col justify-between h-full ${highlight ? "border-2 border-[#f5c800] shadow-xl shadow-[#f5c800]/20" : "border border-[#f3f4f6] shadow-sm"}`}>
      <p className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{title}</p>
      <div>
        <p className={`text-3xl font-black ${highlight ? "text-[#f5c800]" : "text-[#111827]"} mb-1`}>{value}</p>
        {subtitle && <p className="text-xs font-medium text-[#9ca3af]">{subtitle}</p>}
      </div>
    </div>
  );
}

const COLORS = ["#f5c800", "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6"];

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [destination, setDestination] = useState<string>("");
  const [airports, setAirports] = useState<any[]>([]);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/airports")
      .then(res => res.json())
      .then(d => setAirports(d.airports || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ period });
    if (destination) params.append("destination", destination);
    
    fetch(`/api/admin/analytics?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch analytics");
        return json;
      })
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [period, destination]);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-6 py-2 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[#f3f4f6]">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Dashboard Analytics</h1>
          <p className="text-sm text-[#6b7280] font-medium mt-1">Super Admin Overview</p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <select 
            className="bg-[#f3f4f6] text-[#111827] font-bold rounded-xl px-4 py-2 border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#f5c800]"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">All Destinations</option>
            {airports.map(apt => (
              <option key={apt.id} value={apt.id}>{apt.city} ({apt.id})</option>
            ))}
          </select>

          <div className="bg-[#f3f4f6] rounded-xl p-1 flex">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                  period === p ? "bg-white text-[#111827] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && !data && (
        <div className="mt-12"><LoadingState message="Loading analytics..." /></div>
      )}

      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-sm font-semibold flex items-center gap-3">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {data && (
        <>
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="Total Bookings" value={data.overview.totalBookings.toString()} subtitle="Confirmed/Completed" />
            <StatCard title="Total Passengers" value={data.overview.totalPassengers.toString()} subtitle="Active bookings only" />
            <StatCard 
              title="Total Revenue" 
              value={fmtCurrency(data.overview.totalRevenue)} 
              highlight 
            />
            <StatCard 
              title="Avg Occupancy" 
              value={`${data.overview.averageOccupancy}%`} 
              subtitle="Current snapshot" 
            />
            <StatCard 
              title="Estimated Profit" 
              value={fmtCurrency(data.overview.totalRevenue)} 
              subtitle="*Equals Gross Revenue" 
            />
          </div>

          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl text-sm font-semibold border border-yellow-200">
            * <span className="font-bold">Estimated Profit</span> is currently equivalent to Gross Revenue because Operating Cost data is unavailable.
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f3f4f6] flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Booking Volume</h2>
                <p className="text-xs font-medium text-[#6b7280]">Number of bookings over time</p>
              </div>
              {data.bookingVolume.length > 0 ? (
                <div className="h-[300px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bookingVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                      <RechartsTooltip cursor={{ fill: "#f9fafb" }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm font-semibold text-[#9ca3af] bg-[#f9fafb] rounded-2xl">No data available</div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f3f4f6] flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Flight Occupancy (%)</h2>
                <p className="text-xs font-medium text-[#6b7280]">Current booked seats vs total seats</p>
              </div>
              {data.occupancyByFlight.length > 0 ? (
                <div className="h-[300px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.occupancyByFlight} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="flightNumber" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} domain={[0, 100]} />
                      <RechartsTooltip cursor={{ fill: "#f9fafb" }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                      <Bar dataKey="occupancy" fill="#f5c800" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm font-semibold text-[#9ca3af] bg-[#f9fafb] rounded-2xl">No data available</div>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f3f4f6] flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Top Destinations</h2>
                <p className="text-xs font-medium text-[#6b7280]">Grouped by final arrival airport</p>
              </div>
              {data.destinations.length > 0 ? (
                <div className="h-[300px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.destinations}
                        dataKey="count"
                        nameKey="city"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        stroke="none"
                      >
                        {data.destinations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: 13, color: "#374151" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm font-semibold text-[#9ca3af] bg-[#f9fafb] rounded-2xl">No data available</div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f3f4f6] flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Passenger Nationalities</h2>
                <p className="text-xs font-medium text-[#6b7280]">Demographics breakdown</p>
              </div>
              {data.nationalities.length > 0 ? (
                <div className="h-[300px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.nationalities}
                        dataKey="count"
                        nameKey="nationality"
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={90}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {data.nationalities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: 13, color: "#374151" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm font-semibold text-[#9ca3af] bg-[#f9fafb] rounded-2xl">No data available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
