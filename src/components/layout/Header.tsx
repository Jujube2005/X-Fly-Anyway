"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSelector } from "./LocaleSelector";
import { useTranslation } from "@/hooks/useTranslation";

interface HeaderProps {
  variant?: "transparent" | "glass" | "solid";
}

export function Header({ variant = "transparent" }: HeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const bgStyles = {
    transparent: "bg-transparent",
    glass: "bg-white/10 backdrop-blur-md border-b border-white/20",
    solid: "bg-white border-b border-[#e5e7eb]",
  };

  const logoColor = variant === "solid" ? "text-[#111827]" : "text-white";
  const navColor =
    variant === "solid"
      ? "text-[#374151] hover:text-[#111827]"
      : "text-white/80 hover:text-white";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${bgStyles[variant]}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Yellow wing icon */}
          <svg
            width="32"
            height="28"
            viewBox="0 0 32 28"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 24L16 4L30 24H20L16 18L12 24H2Z"
              fill="#f5c800"
              className="group-hover:scale-105 transition-transform origin-bottom"
            />
          </svg>
          <span className={`text-lg font-bold tracking-tight ${logoColor}`}>
            X-Fly Anyway
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
                      { href: "/", label: t.nav.book },
            { href: "/flights", label: t.nav.flights },
            { href: "/booking/confirmation", label: t.nav.myBooking },
          ].map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors relative pb-0.5 ${navColor} ${
                  isActive
                    ? "!text-[#f5c800] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#f5c800] after:rounded-full"
                    : ""
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions — Admin access is via company devices only */}
        <LocaleSelector
          textColor={variant === "solid" ? "text-[#374151]" : "text-white/80"}
        />
      </div>
    </header>
  );
}
