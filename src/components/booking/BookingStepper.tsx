"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

const STEPS = [
  { key: "flight", path: "/flights" },
  { key: "passengers", path: "/booking/passenger" },
  { key: "seats", path: "/booking/seat" },
  { key: "payment", path: "/booking/payment" },
  { key: "confirmation", path: "/booking/confirmation" },
] as const;

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
  const { t } = useTranslation();
  const activeIdx = getActiveIndex(pathname);

  const stepLabels: Record<string, string> = {
    flight: t.booking?.stepper?.flight ?? "Flight",
    passengers: t.booking?.stepper?.passengers ?? "Passengers",
    seats: t.booking?.stepper?.seats ?? "Seats",
    payment: t.booking?.stepper?.payment ?? "Payment",
    confirmation: t.booking?.stepper?.confirmation ?? "Confirmation",
  };

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
        const baseLabel = stepLabels[step.key] ?? step.key;
        const label = isActive && currentLabel ? currentLabel : baseLabel;

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
