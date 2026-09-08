"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import type { Booking } from "@/types/booking";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  chart?: boolean;
}

// Mini sparkline chart (SVG path from dummy data)
function SparklineChart() {
  const points = [30, 50, 40, 70, 60, 90, 80, 110, 95, 130].map((v, i) => {
    const x = (i / 9) * 300;
    const y = 80 - (v / 130) * 70;
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 300 80" className="w-full h-16" aria-hidden="true">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c800" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f5c800" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#f5c800"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,80 ${points.join(" ")} 300,80`}
        fill="url(#sparkGrad)"
      />
    </svg>
  );
}

function StatCard({ title, value, subtitle, chart }: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-[#374151]">{title}</p>
        <button className="text-[#9ca3af] hover:text-[#6b7280]" aria-label="Options">⋯</button>
      </div>
      <p className="text-3xl font-bold text-[#111827] mb-1">{value}</p>
      {subtitle && <p className="text-xs text-[#9ca3af]">{subtitle}</p>}
      {chart && <div className="mt-3"><SparklineChart /></div>}
    </div>
  );
}

function statusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    confirmed: "confirmed",
    pending: "pending",
    cancelled: "cancelled",
    completed: "confirmed",
  };
  type BadgeVariant = "confirmed" | "pending" | "cancelled" | "yellow" | "green" | "blue" | "red" | "grey" | "boarding" | "departed" | "arrived" | "scheduled";
  return <Badge variant={map[status] ?? "grey"}>{status}</Badge>;
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : data.bookings ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + Number(b.totalAmount ?? 0), 0);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827]">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f5c800]/20 flex items-center justify-center text-sm">👤</div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">Admin</p>
          </div>
          <button className="relative" aria-label="Notifications">
            <span className="text-[#f5c800] text-xl">🔔</span>
          </button>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard
          title={`Total Revenue (Last 30 Days)`}
          value={isLoading ? "..." : fmtCurrency(totalRevenue)}
          chart
        />
        <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-semibold text-[#374151]">Flight Status</p>
            <button className="text-[#9ca3af]" aria-label="Options">⋯</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Scheduled", color: "#3b82f6" },
              { label: "Boarding", color: "#f5c800" },
              { label: "Departed", color: "#6b7280" },
              { label: "Arrived", color: "#22c55e" },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: color }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent bookings table */}
        <div
          className="lg:col-span-2 bg-white rounded-3xl p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#111827]">Recent Bookings</h2>
            <button className="text-[#9ca3af]" aria-label="Options">⋯</button>
          </div>

          {isLoading ? (
            <LoadingState message="Loading bookings..." />
          ) : (
            <>
              <table className="w-full text-sm" aria-label="Recent bookings">
                <thead>
                  <tr className="text-left text-xs text-[#9ca3af] font-semibold uppercase tracking-wide border-b border-[#f3f4f6]">
                    <th className="pb-3 pr-3">Booking Ref</th>
                    <th className="pb-3 pr-3">Contact</th>
                    <th className="pb-3 pr-3">Flight</th>
                    <th className="pb-3 pr-3">Date</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-[#f3f4f6] hover:bg-[#fafafa] transition-colors"
                    >
                      <td className="py-3 pr-3 font-mono text-xs text-[#374151]">
                        {b.reference}
                      </td>
                      <td className="py-3 pr-3 text-[#374151]">
                        {b.contact?.email ?? "—"}
                      </td>
                      <td className="py-3 pr-3 text-[#374151]">{b.flightId?.slice(0, 8)}</td>
                      <td className="py-3 pr-3 text-[#374151]">
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3 pr-3">{statusBadge(b.status)}</td>
                      <td className="py-3 text-right font-semibold text-[#111827]">
                        {fmtCurrency(Number(b.totalAmount ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {bookings.length === 0 && (
                <p className="text-sm text-[#9ca3af] text-center py-8">No bookings yet.</p>
              )}

              <div className="mt-4 flex justify-center">
                <Link
                  href="/admin/bookings"
                  className="px-6 py-2.5 bg-[#f5c800] text-[#111827] text-sm font-semibold rounded-xl hover:bg-[#e6b800] transition-colors"
                >
                  View All Bookings
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <StatCard
            title="Total Bookings"
            value={isLoading ? "..." : String(bookings.length)}
            subtitle="All time"
          />
          <div
            className="bg-white rounded-3xl p-6"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#374151]">System Alerts</p>
              <button className="text-[#9ca3af]" aria-label="Options">⋯</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { msg: "All systems operational" },
                { msg: "Database backup completed" },
              ].map(({ msg }) => (
                <div key={msg} className="flex items-start gap-2">
                  <span className="text-[#f5c800] mt-0.5">🔔</span>
                  <p className="text-sm text-[#374151]">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
