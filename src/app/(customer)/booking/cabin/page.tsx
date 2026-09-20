"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import type { CabinClass } from "@/types/flight";
import "./page.css";

/* ─── Airline Cabin Feature Icons ────────────────────────────── */

function IconLuggage({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="7" width="14" height="13" rx="2.5" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <line x1="10" y1="11" x2="10" y2="16" />
      <line x1="14" y1="11" x2="14" y2="16" />
      <circle cx="8" cy="20" r="1" fill="currentColor" />
      <circle cx="16" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function IconSeat({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7" />
      <path d="M13 16h5a2 2 0 0 1 2 2v3" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <line x1="5" y1="9" x2="7" y2="9" />
    </svg>
  );
}

function IconExtraLegroom({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6" />
      <path d="M12 16h6a2 2 0 0 1 2 2v3" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <path d="M15 7l2 2-2 2" />
      <path d="M19 7l2 2-2 2" />
    </svg>
  );
}

function IconSnackDrink({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="3" x2="6" y2="5" />
      <line x1="10" y1="2" x2="10" y2="5" />
      <line x1="14" y1="3" x2="14" y2="5" />
    </svg>
  );
}

function IconDining({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18h18" />
      <path d="M4 18a8 8 0 0 1 16 0" />
      <circle cx="12" cy="7" r="1.5" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  );
}

function IconWine({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M6 3h12v4a6 6 0 0 1-12 0V3z" />
      <line x1="6" y1="7" x2="18" y2="7" />
    </svg>
  );
}

function IconChampagne({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M7 4h10l-1 5a4 4 0 0 1-4 3 4 4 0 0 1-4-3L7 4z" />
      <line x1="10" y1="2" x2="11" y2="4" />
      <line x1="14" y1="2" x2="13" y2="4" />
    </svg>
  );
}

function IconLieFlat({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17h18" />
      <path d="M3 12v5" />
      <path d="M21 12v5" />
      <path d="M3 13h11a2 2 0 0 1 2 2v2H3v-4z" />
      <circle cx="7" cy="8.5" r="2" />
    </svg>
  );
}

function IconSuite({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="3 3" />
    </svg>
  );
}

function IconPriority({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round" />
    </svg>
  );
}

function IconNoPriority({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconLounge({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M6 18v3" />
      <path d="M18 18v3" />
    </svg>
  );
}

function IconConcierge({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4V2" />
      <path d="M10 2h4" />
      <path d="M4 18h16a1 1 0 0 0 1-1c0-4.42-3.58-8-8-8s-8 3.58-8 8a1 1 0 0 0 1 1z" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  );
}

function IconRefundShield({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function CabinClassPage() {
  const router = useRouter();
  const { selectedLegs, setCabinClass } = useBookingContext();
  const { t } = useTranslation();

  // Cabin details reactive to active language and using clean professional SVG icons
  const CABIN_DETAILS = {
    economy: {
      label: t.search?.cabinClass?.economy ?? "Economy",
      features: [
        { icon: IconLuggage, text: t.booking?.cabin?.features?.economy?.[0] ?? "1 x 23kg Checked Bag", negative: false },
        { icon: IconSeat, text: t.booking?.cabin?.features?.economy?.[1] ?? "Standard Legroom", negative: false },
        { icon: IconSnackDrink, text: t.booking?.cabin?.features?.economy?.[2] ?? "Complimentary Snack & Drink", negative: false },
        { icon: IconNoPriority, text: t.booking?.cabin?.features?.economy?.[3] ?? "No Priority Boarding", negative: true },
        { icon: IconRefundShield, text: t.booking?.cabin?.features?.economy?.[4] ?? "Refundable if cancelled 24hr before departure", negative: false },
      ],
    },
    premium_economy: {
      label: t.search?.cabinClass?.premium_economy ?? "Premium Economy",
      features: [
        { icon: IconLuggage, text: t.booking?.cabin?.features?.premium_economy?.[0] ?? "2 x 23kg Checked Bags", negative: false },
        { icon: IconExtraLegroom, text: t.booking?.cabin?.features?.premium_economy?.[1] ?? "Extra Legroom", negative: false },
        { icon: IconDining, text: t.booking?.cabin?.features?.premium_economy?.[2] ?? "Premium Meal Service", negative: false },
        { icon: IconPriority, text: t.booking?.cabin?.features?.premium_economy?.[3] ?? "Priority Boarding", negative: false },
        { icon: IconRefundShield, text: t.booking?.cabin?.features?.premium_economy?.[4] ?? "Refundable if cancelled 24hr before departure", negative: false },
      ],
    },
    business: {
      label: t.search?.cabinClass?.business ?? "Business",
      features: [
        { icon: IconLuggage, text: t.booking?.cabin?.features?.business?.[0] ?? "3 x 32kg Checked Bags", negative: false },
        { icon: IconLieFlat, text: t.booking?.cabin?.features?.business?.[1] ?? "Lie-Flat Seat", negative: false },
        { icon: IconWine, text: t.booking?.cabin?.features?.business?.[2] ?? "Gourmet Dining", negative: false },
        { icon: IconLounge, text: t.booking?.cabin?.features?.business?.[3] ?? "Lounge Access", negative: false },
        { icon: IconRefundShield, text: t.booking?.cabin?.features?.business?.[4] ?? "Refundable if cancelled 24hr before departure", negative: false },
      ],
    },
    first: {
      label: t.search?.cabinClass?.first ?? "First",
      features: [
        { icon: IconLuggage, text: t.booking?.cabin?.features?.first?.[0] ?? "Unlimited Baggage", negative: false },
        { icon: IconSuite, text: t.booking?.cabin?.features?.first?.[1] ?? "Private Suite", negative: false },
        { icon: IconChampagne, text: t.booking?.cabin?.features?.first?.[2] ?? "Fine Dining & Champagne", negative: false },
        { icon: IconConcierge, text: t.booking?.cabin?.features?.first?.[3] ?? "Dedicated Concierge", negative: false },
        { icon: IconRefundShield, text: t.booking?.cabin?.features?.first?.[4] ?? "Refundable if cancelled 24hr before departure", negative: false },
      ],
    },
  };

  useEffect(() => {
    if (!selectedLegs || selectedLegs.length === 0) {
      router.replace("/");
    }
  }, [selectedLegs, router]);

  if (!selectedLegs || selectedLegs.length === 0) {
    return null;
  }

  // Aggregate cabin availability across all legs
  // A cabin is available if it exists and has seats on ALL legs
  // Price is the sum of prices on all legs
  const cabinMap = new Map<CabinClass, { price: number; currency: string; minAvailable: number }>();
  
  if (selectedLegs.length > 0) {
    const firstLegCabins = selectedLegs[0].cabinClasses ?? [];
    for (const c of firstLegCabins) {
      cabinMap.set(c.cabinClass, {
        price: c.price,
        currency: c.currency,
        minAvailable: c.availableSeats
      });
    }

    for (let i = 1; i < selectedLegs.length; i++) {
      const legCabins = selectedLegs[i].cabinClasses ?? [];
      for (const [cClass, data] of Array.from(cabinMap.entries())) {
        const legC = legCabins.find(lc => lc.cabinClass === cClass);
        if (!legC) {
          cabinMap.delete(cClass); // Missing on this leg, cannot be booked
        } else {
          data.price += legC.price;
          data.minAvailable = Math.min(data.minAvailable, legC.availableSeats);
        }
      }
    }
  }

  const availableCabins = Array.from(cabinMap.entries()).map(([cClass, data]) => ({
    cabinClass: cClass,
    price: data.price,
    currency: data.currency,
    availableSeats: data.minAvailable,
  }));

  function handleSelect(cabin: CabinClass) {
    setCabinClass(cabin);
    router.push("/booking/seat");
  }

  const displayCabins =
    availableCabins.length > 0
      ? availableCabins
      : (["economy", "premium_economy", "business"] as CabinClass[]).map((c) => ({
          cabinClass: c,
          price: c === "economy" ? 280 : c === "premium_economy" ? 560 : 1450,
          currency: "USD",
          availableSeats: 20,
        }));

  return (
    <div 
      className="min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url("/images/BG/Cloud2.png")' }}
    >
      {/* Subtle overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-dvh">
        <Header variant="glass" />

        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111827] mb-12 text-center glass-text-contrast">
            {t.booking.cabin.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {displayCabins.slice(0, 3).map((cabin) => {
              const details = CABIN_DETAILS[cabin.cabinClass] ?? CABIN_DETAILS.economy;
              const priceDisplay = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: cabin.currency,
                maximumFractionDigits: 0,
              }).format(cabin.price);

              return (
                <div
                  key={cabin.cabinClass}
                  className="glass-card flex flex-col p-8 transition-transform hover:-translate-y-1 relative overflow-hidden group"
                >
                  <h2 className="text-3xl font-bold text-[#111827] mb-8 text-center group-hover:text-brand-yellow transition-colors">
                    {details.label}
                  </h2>

                  <ul className="flex flex-col gap-4 flex-1 mb-8">
                    {details.features.map((f, idx) => {
                      const IconComponent = f.icon;
                      return (
                        <li key={idx} className="flex items-center gap-3 text-sm">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              f.negative
                                ? "bg-white/40 text-slate-500 border border-white/50"
                                : "bg-brand-yellow/20 text-brand-yellow-dark border border-brand-yellow/40"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </span>
                          <span
                            className={`leading-snug ${
                              f.negative ? "text-slate-500" : "text-[#111827] font-medium"
                            }`}
                          >
                            {f.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {cabin.availableSeats === 0 ? (
                    <div className="w-full py-3 text-center text-sm text-[#9ca3af] font-medium rounded-xl border border-[#e5e7eb] bg-white/30 backdrop-blur-md">
                      {t.booking.cabin.soldOut}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelect(cabin.cabinClass)}
                      className="glass-button w-full py-3.5 font-semibold text-[#111827] focus-visible:outline-2 focus-visible:outline-[#f5c800]"
                    >
                      {t.booking.cabin.selectFrom} {priceDisplay}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
