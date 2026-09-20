"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./AdminSidebar.css";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", roles: ["super_admin"], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: "/admin/bookings", label: "Bookings", roles: ["super_admin", "booking_staff"], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg> },
  { href: "/admin/flights", label: "Flights", roles: ["super_admin", "flight_staff"], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.6 7.8 3.1-4 4-3.3-1.1c-.5-.2-1-.1-1.3.3l-1.6 1.6 4.9 2 2 4.9 1.6-1.6c.4-.3.5-.8.3-1.3l-1.1-3.3 4-4 3.1 7.8 3.6-1.2c.5-.2.8-.6.7-1.1z"/></svg> },
  { href: "/admin/tokens", label: "API Tokens", roles: ["super_admin"], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> },
];

export function AdminSidebar({ role }: { role: string }) {
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
        {NAV_ITEMS.filter(item => item.roles.includes(role)).map(({ href, label, icon }) => {
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
        {[
          { href: "/", label: "Back to Site", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg> },
          { href: "/admin/login", label: "Log Out", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
        ].map(({ href, label, icon }) => (
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
