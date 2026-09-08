"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { label: "Flight", path: "/flights" },
  { label: "Passengers", path: "/booking/passenger" },
  { label: "Seats", path: "/booking/seat" },
  { label: "Payment", path: "/booking/payment" },
  { label: "Confirmation", path: "/booking/confirmation" },
];

function getActiveIndex(pathname: string) {
  const idx = STEPS.findIndex((s) => pathname.startsWith(s.path));
  return idx === -1 ? 0 : idx;
}

interface BookingStepperProps {
  /** Override the active step label (e.g. "Seats (Current)") */
  currentLabel?: string;
  variant?: "light" | "dark";
}

export function BookingStepper({ currentLabel, variant = "light" }: BookingStepperProps) {
  const pathname = usePathname();
  const activeIdx = getActiveIndex(pathname);

  const textBase = variant === "dark" ? "text-white/60" : "text-[#6b7280]";
  const textActive = "text-[#f5c800] font-semibold";
  const textDone = variant === "dark" ? "text-white/80" : "text-[#374151]";
  const dividerColor = variant === "dark" ? "text-white/30" : "text-[#d1d5db]";

  return (
    <nav
      aria-label="Booking progress"
      className="flex items-center gap-1 text-sm flex-wrap justify-center"
    >
      {STEPS.map((step, idx) => {
        const isActive = idx === activeIdx;
        const isDone = idx < activeIdx;
        const label = isActive && currentLabel ? currentLabel : step.label;

        return (
          <span key={step.path} className="flex items-center gap-1">
            <span
              className={
                isActive ? textActive : isDone ? textDone : textBase
              }
            >
              {label}
            </span>
            {idx < STEPS.length - 1 && (
              <svg
                className={`w-3 h-3 ${dividerColor}`}
                viewBox="0 0 12 12"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </span>
        );
      })}
    </nav>
  );
}
