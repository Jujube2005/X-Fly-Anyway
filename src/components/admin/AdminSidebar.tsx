"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./AdminSidebar.css";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: "🏠" },
  { href: "/admin/bookings", label: "Bookings", icon: "📋" },
  { href: "/admin/flights", label: "Flights", icon: "✈️" },
  { href: "/admin/revenue", label: "Reports", icon: "📊" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white rounded-3xl flex flex-col py-8 px-4 admin-sidebar">
      {/* Logo */}
      <div className="px-2 mb-8">
        <span className="text-lg font-black text-[#111827]">
          <span className="text-[#f5c800]">X-Fly</span> Anyway
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#f5c800] text-[#111827] shadow-sm"
                  : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-1">
        {[{ href: "/admin/login", label: "Log Out", icon: "↩️" }].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] transition-all"
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
