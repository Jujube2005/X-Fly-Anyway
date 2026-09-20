"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import "./page.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(dep: string, arr: string, directLabel: string = "Direct") {
  const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m, ${directLabel}`;
}


export default function BookingSummaryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedLegs, cabinClass, selectedSeats, passengers, contact } =
    useBookingContext();

  useEffect(() => {
    if (!selectedLegs || selectedLegs.length === 0 || !contact) {
      router.replace("/");
    }
  }, [selectedLegs, contact, router]);

  if (!selectedLegs || selectedLegs.length === 0 || !contact) {
    return null;
  }

  // Find price from cabinClasses across all legs
  let basePrice = 0;
  let currency = "THB";
  
  for (const leg of selectedLegs) {
    const cabinInfo = (leg.cabinClasses ?? []).find(
      (c) => c.cabinClass === cabinClass
    );
    if (cabinInfo) {
      basePrice += Number(cabinInfo.price);
      currency = cabinInfo.currency;
    }
  }
  
  const totalAmount = basePrice * passengers.length;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div 
      className="min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url("/images/BG/airport.png")' }}
    >
      <div className="absolute inset-0 backdrop-blur-xs" />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <Header variant="glass" />

        <main className="summary-main flex-1 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-5 lg:items-start">
            {/* Left — booking details */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-[#111827] uppercase tracking-wide glass-text-contrast">
                {t.booking?.summary?.title ?? "Booking Summary"}
              </h1>

            {/* Flight details */}
            <div className="rounded-2xl p-5 glass-card">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 drop-shadow-sm">
                {t.booking?.summary?.flightDetails ?? "Flight Details"}
              </h2>
              <div className="flex flex-col gap-4">
                {selectedLegs.map((leg) => (
                  <div key={leg.id} className="rounded-xl p-4 glass-panel border border-slate-300/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#111827]">
                        {t.booking?.summary?.flight ?? "Flight"}{" "}
                        <span className="text-[#b48c00]">
                          {leg.flightNumber}
                        </span>
                        : {leg.origin.airport_code} {t.booking?.summary?.to ?? "to"}{" "}
                        {leg.destination.airport_code}
                      </span>
                      <span className="text-xs text-slate-600 font-medium capitalize">
                        {cabinClass?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-[#111827] font-bold">
                          {formatDate(leg.departureAt)}
                        </p>
                        <p className="text-slate-600 font-medium">
                          {formatTime(leg.departureAt)}
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <p className="text-xs text-slate-500 font-medium">
                          {formatDuration(
                            leg.departureAt,
                            leg.arrivalAt,
                            t.booking?.summary?.direct ?? "Direct"
                          )}
                        </p>
                        <div className="w-full flex items-center gap-1 mt-1">
                          <div className="flex-1 h-px bg-slate-400/40" />
                          <span className="text-brand-yellow-dark text-xs drop-shadow-sm">✈</span>
                          <div className="flex-1 h-px bg-slate-400/40" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#111827] font-bold">
                          {formatDate(leg.arrivalAt)}
                        </p>
                        <p className="text-slate-600 font-medium">
                          {formatTime(leg.arrivalAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passenger info */}
            <div className="rounded-2xl p-5 glass-card mt-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 drop-shadow-sm">
                {t.booking?.summary?.passengerInfo ?? "Passenger Information"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 glass-panel border border-slate-300/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-slate-600 text-xs shadow-sm">
                        👤
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">
                          {t.booking?.summary?.passenger ?? "Passenger"} {i + 1}:
                        </p>
                        <p className="text-sm text-slate-800 font-medium">
                          {p.title} {p.firstName} {p.lastName}, {t.booking?.passenger?.adult ?? "Adult"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium ml-9 mt-1">
                      {t.booking?.passenger?.dateOfBirth ?? "DOB"}: {p.dateOfBirth}
                    </p>
                    {p.passportNumber && (
                      <p className="text-xs text-slate-600 font-medium ml-9">
                        {t.booking?.passenger?.passportNumber ?? "Passport"}: *****{p.passportNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Seat choice */}
            {selectedSeats.length > 0 && (
              <div className="rounded-2xl p-5 glass-card mt-4">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 drop-shadow-sm">
                  {t.booking?.summary?.seatChoice ?? "Seat Choice"}
                </h2>
                <div className="flex flex-col gap-4">
                  {selectedLegs.map((leg, legIdx) => {
                    const legSeats = selectedSeats[legIdx] || [];
                    if (legSeats.length === 0) return null;
                    return (
                      <div key={leg.id} className="rounded-xl p-4 glass-panel border border-slate-300/50">
                        <p className="text-sm font-bold text-[#b48c00] mb-2">{leg.origin.airport_code} {t.booking?.summary?.to ?? "to"} {leg.destination.airport_code}</p>
                        {passengers.map((p, pIdx) => {
                          const seatNumber = legSeats[pIdx];
                          return seatNumber ? (
                            <p key={pIdx} className="text-sm text-slate-800 font-medium mb-1">
                              <span className="font-bold text-[#111827]">
                                {p.firstName} {p.lastName}
                              </span>
                              : {t.booking?.summary?.seat ?? "Seat"} {seatNumber} ({cabinClass})
                            </p>
                          ) : null;
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right — price + CTA */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="rounded-2xl p-6 glass-card border-[#f5c800]/30 shadow-md">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 drop-shadow-sm">
                {t.booking?.summary?.priceBreakdown ?? "Price Breakdown"}
              </h2>

              <div className="flex flex-col gap-3 text-sm mb-5 font-medium text-slate-800">
                <div className="flex justify-between">
                  <span>{t.booking?.summary?.baseFare ?? "Base Fare"}</span>
                  <span className="font-semibold">{fmt(basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.booking?.summary?.passengersCount ?? "Passengers"}</span>
                  <span className="font-semibold">× {passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.booking?.summary?.baggageFees ?? "Baggage Fees"}</span>
                  <span className="font-semibold text-emerald-700">{t.booking?.summary?.baggageIncluded ?? "$0.00 (Included)"}</span>
                </div>
                <div className="border-t border-slate-300/50 pt-3">
                  <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">
                    {t.booking?.summary?.totalAmount ?? "Total Amount"}
                  </p>
                  <p className="text-3xl font-bold text-[#111827]">
                    {fmt(totalAmount)}
                  </p>
                </div>
              </div>

              <Button fullWidth onClick={() => router.push("/booking/payment")} className="bg-[#f5c800] text-slate-950 hover:bg-[#e6bb00] shadow-md border-0 text-sm font-bold">
                {t.booking?.summary?.proceedToPayment ?? "PROCEED TO PAYMENT →"}
              </Button>
              <p className="text-center text-xs text-slate-600 font-medium mt-3">
                {t.booking?.summary?.secureTransaction ?? "Secure transaction guaranteed."}
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
