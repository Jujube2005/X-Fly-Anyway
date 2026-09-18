"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useBookingContext } from "@/components/booking/BookingProvider";
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

function formatDuration(dep: string, arr: string) {
  const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m, Direct`;
}


export default function BookingSummaryPage() {
  const router = useRouter();
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
    <div className="min-h-dvh flex flex-col summary-page-container">
      <Header variant="glass" />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-5 items-start">
          {/* Left — booking details */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
              Booking Summary
            </h1>

            {/* Flight details */}
            <div className="rounded-2xl p-5 summary-glass-card">
              <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
                Flight Details
              </h2>
              <div className="flex flex-col gap-4">
                {selectedLegs.map((leg, legIndex) => (
                  <div key={leg.id} className="rounded-xl p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white">
                        Flight{" "}
                        <span className="text-[#f5c800]">
                          {leg.flightNumber}
                        </span>
                        : {leg.origin.airport_code} to{" "}
                        {leg.destination.airport_code}
                      </span>
                      <span className="text-xs text-white/50">
                        {cabinClass?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-white font-bold">
                          {formatDate(leg.departureAt)}
                        </p>
                        <p className="text-white/60">
                          {formatTime(leg.departureAt)}
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <p className="text-xs text-white/50">
                          {formatDuration(
                            leg.departureAt,
                            leg.arrivalAt
                          )}
                        </p>
                        <div className="w-full flex items-center gap-1 mt-1">
                          <div className="flex-1 h-px bg-white/20" />
                          <span className="text-[#f5c800] text-xs">✈</span>
                          <div className="flex-1 h-px bg-white/20" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {formatDate(leg.arrivalAt)}
                        </p>
                        <p className="text-white/60">
                          {formatTime(leg.arrivalAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passenger info */}
            <div className="rounded-2xl p-5 summary-glass-card">
              <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
                Passenger Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs">
                        👤
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Passenger {i + 1}:
                        </p>
                        <p className="text-sm text-white/80">
                          {p.title} {p.firstName} {p.lastName}, Adult
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-white/50 ml-9">
                      DOB: {p.dateOfBirth}
                    </p>
                    {p.passportNumber && (
                      <p className="text-xs text-white/50 ml-9">
                        Passport: *****{p.passportNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Seat choice */}
            {selectedSeats.length > 0 && (
              <div className="rounded-2xl p-5 summary-glass-card">
                <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
                  Seat Choice
                </h2>
                <div className="flex flex-col gap-4">
                  {selectedLegs.map((leg, legIdx) => {
                    const legSeats = selectedSeats[legIdx] || [];
                    if (legSeats.length === 0) return null;
                    return (
                      <div key={leg.id} className="rounded-xl p-4 bg-white/5 border border-white/10">
                        <p className="text-sm font-bold text-[#f5c800] mb-2">{leg.origin.airport_code} to {leg.destination.airport_code}</p>
                        {passengers.map((p, pIdx) => {
                          const seatNumber = legSeats[pIdx];
                          return seatNumber ? (
                            <p key={pIdx} className="text-sm text-white/80 mb-1">
                              <span className="font-bold text-white">
                                {p.firstName} {p.lastName}
                              </span>
                              : Seat {seatNumber} ({cabinClass})
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
            <div className="rounded-2xl p-6 summary-price-card">
              <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
                Price Breakdown
              </h2>

              <div className="flex flex-col gap-3 text-sm mb-5">
                <div className="flex justify-between text-white/80">
                  <span>Base Fare</span>
                  <span>{fmt(basePrice)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Passengers</span>
                  <span>× {passengers.length}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Baggage Fees</span>
                  <span>$0.00 (Included)</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {fmt(totalAmount)}
                  </p>
                </div>
              </div>

              <Button fullWidth onClick={() => router.push("/booking/payment")}>
                PROCEED TO PAYMENT →
              </Button>
              <p className="text-center text-xs text-white/40 mt-3">
                Secure transaction guaranteed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
