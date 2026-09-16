"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import type { CabinClass } from "@/types/flight";
import "./page.css";

const CABIN_DETAILS = {
  economy: {
    label: "Economy",
    color: "#6b7280",
    features: [
      { icon: "🧳", text: "1 x 23kg Checked Bag" },
      { icon: "💺", text: "Standard Legroom" },
      { icon: "🥤", text: "Complimentary Snack & Drink" },
      { icon: "🚫", text: "No Priority Boarding" },
      { icon: "❌", text: "Non-Refundable" },
    ],
  },
  premium_economy: {
    label: "Premium",
    color: "#f5c800",
    features: [
      { icon: "🧳", text: "2 x 23kg Checked Bags" },
      { icon: "💺", text: "Extra Legroom" },
      { icon: "🍽️", text: "Premium Meal Service" },
      { icon: "⭐", text: "Priority Boarding" },
      { icon: "🔄", text: "Flexible Changes" },
    ],
  },
  business: {
    label: "Business",
    color: "#f5c800",
    features: [
      { icon: "🧳", text: "3 x 32kg Checked Bags" },
      { icon: "🛏️", text: "Lie-Flat Seat" },
      { icon: "🍷", text: "Gourmet Dining" },
      { icon: "🛋️", text: "Lounge Access" },
      { icon: "✅", text: "Fully Refundable" },
    ],
  },
  first: {
    label: "First",
    color: "#f5c800",
    features: [
      { icon: "🧳", text: "Unlimited Baggage" },
      { icon: "🛏️", text: "Private Suite" },
      { icon: "🍾", text: "Fine Dining & Champagne" },
      { icon: "🌟", text: "Dedicated Concierge" },
      { icon: "✅", text: "Fully Refundable" },
    ],
  },
};

export default function CabinClassPage() {
  const router = useRouter();
  const { selectedFlight, setCabinClass } = useBookingContext();
  const { t } = useTranslation();

  // Build CABIN_DETAILS inside the component so it reacts to language changes
  const CABIN_DETAILS = {
    economy: {
      label: t.search.cabinClass.economy,
      color: "#6b7280",
      features: [
        { icon: "🧳", text: t.booking.cabin.features.economy[0] },
        { icon: "💺", text: t.booking.cabin.features.economy[1] },
        { icon: "🥤", text: t.booking.cabin.features.economy[2] },
        { icon: "🚫", text: t.booking.cabin.features.economy[3] },
        { icon: "❌", text: t.booking.cabin.features.economy[4] },
      ],
    },
    premium_economy: {
      label: t.search.cabinClass.premium_economy,
      color: "#f5c800",
      features: [
        { icon: "🧳", text: t.booking.cabin.features.premium_economy[0] },
        { icon: "💺", text: t.booking.cabin.features.premium_economy[1] },
        { icon: "🍽️", text: t.booking.cabin.features.premium_economy[2] },
        { icon: "⭐", text: t.booking.cabin.features.premium_economy[3] },
        { icon: "🔄", text: t.booking.cabin.features.premium_economy[4] },
      ],
    },
    business: {
      label: t.search.cabinClass.business,
      color: "#f5c800",
      features: [
        { icon: "🧳", text: t.booking.cabin.features.business[0] },
        { icon: "🛌️", text: t.booking.cabin.features.business[1] },
        { icon: "🍷", text: t.booking.cabin.features.business[2] },
        { icon: "🛋️", text: t.booking.cabin.features.business[3] },
        { icon: "✅", text: t.booking.cabin.features.business[4] },
      ],
    },
    first: {
      label: t.search.cabinClass.first,
      color: "#f5c800",
      features: [
        { icon: "🧳", text: t.booking.cabin.features.first[0] },
        { icon: "🛌️", text: t.booking.cabin.features.first[1] },
        { icon: "🍾", text: t.booking.cabin.features.first[2] },
        { icon: "🌟", text: t.booking.cabin.features.first[3] },
        { icon: "✅", text: t.booking.cabin.features.first[4] },
      ],
    },
  };

  if (!selectedFlight) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  const availableCabins = (selectedFlight.cabinClasses ?? []) as Array<{
    cabinClass: CabinClass;
    price: number;
    currency: string;
    availableSeats: number;
  }>;

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
    <div className="min-h-dvh flex flex-col cabin-page-container">
      <Header variant="glass" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#111827] mb-12 text-center">
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
                className="flex flex-col rounded-3xl p-8 transition-transform hover:-translate-y-1 cabin-card-glass"
              >
                <h2 className="text-3xl font-bold text-[#111827] mb-8 text-center">
                  {details.label}
                </h2>

                <ul className="flex flex-col gap-4 flex-1 mb-8">
                  {details.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3 text-[#374151] text-sm">
                      <span className="text-[#f5c800] text-base leading-none mt-0.5">{f.icon}</span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {cabin.availableSeats === 0 ? (
                  <div className="w-full py-3 text-center text-sm text-[#9ca3af] font-medium rounded-xl border border-[#e5e7eb]">
                    {t.booking.cabin.soldOut}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(cabin.cabinClass)}
                    className="w-full py-3.5 rounded-xl font-semibold text-[#111827] transition-all hover:brightness-95 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#f5c800] cabin-btn"
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
  );
}
