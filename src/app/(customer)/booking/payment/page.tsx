"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useBookingContext } from "@/components/booking/BookingProvider";
import type { PaymentMethod } from "@/types/payment";
import "./page.css";

type Method = "credit_card" | "card_charge" | "bitcoin";

const METHOD_LABELS: Record<Method, string> = {
  credit_card: "Credit Card",
  card_charge: "Card Charge (Direct Debit)",
  bitcoin: "Bitcoin",
};

const inputCls =
  "w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all backdrop-blur-sm";

export default function PaymentPage() {
  const router = useRouter();
  const {
    selectedLegs,
    cabinClass,
    selectedSeats,
    passengers,
    contact,
    setBookingRef,
  } = useBookingContext();

  const [method, setMethod] = useState<Method>("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedLegs || selectedLegs.length === 0 || !contact || !cabinClass) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

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

  function parseExpiry(exp: string): { month: number; year: number } {
    const [mm, yy] = exp.split("/");
    return { month: parseInt(mm ?? "0"), year: 2000 + parseInt(yy ?? "0") };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { month: expiryMonth, year: expiryYear } = parseExpiry(expiry);

      const bookingPayload = {
        booking: {
          flightIds: selectedLegs.map((l) => l.id),
          cabinClass: cabinClass!,
          passengers: passengers.map((p) => ({
            type: "adult" as const,
            title: p.title,
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            nationality: p.nationality,
            passportNumber: p.passportNumber,
            passportExpiry: p.passportExpiry,
          })),
          contact: {
            firstName: contact!.firstName,
            lastName: contact!.lastName,
            email: contact!.email,
            phone: contact!.phone,
          },
          seatNumbers: selectedLegs.map((_, i) =>
            (selectedSeats[i] ?? []).filter(Boolean)
          ),
        },
        payment: {
          method: method as PaymentMethod,
          ...(method !== "bitcoin"
            ? {
                card: {
                  cardNumber: cardNumber.replace(/\s/g, ""),
                  cardHolder,
                  expiryMonth,
                  expiryYear,
                  cvv,
                },
              }
            : {}),
        },
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.reason ?? data.error ?? "Payment failed. Please try again.");
        return;
      }

      setBookingRef(data.reference);
      router.push("/booking/confirmation");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function formatCardNumber(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  return (
    <div className="min-h-dvh flex flex-col payment-page-container">
      <Header variant="glass" />

      <main className="flex-1 pt-24 pb-12 px-4 flex items-start justify-center">
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden payment-card-glass">
          {/* Header bar */}
          <div className="px-8 py-5 border-b border-white/10 flex items-center gap-4">
            <span className="text-lg font-bold text-white">X-Fly Anyway</span>
            <span className="text-white/30">|</span>
            <span className="text-[#f5c800] font-semibold">Payment Information</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-0">
            {/* Left: flight summary */}
            <div className="lg:w-64 p-6 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#f5c800] text-xl">✈</span>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                {selectedLegs.map((leg) => (
                  <div key={leg.id}>
                    <p className="text-white font-bold text-sm mb-1">
                      Flight {leg.flightNumber} — {leg.origin.airport_code} to {leg.destination.airport_code}
                    </p>
                    <p className="text-white/50 text-xs">
                      {new Date(leg.departureAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-white/50 mb-1">Total</p>
                <p className="text-2xl font-bold text-white">{fmt(totalAmount)}</p>
                <div className="mt-3 text-xs text-white/40 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>Base Fare × {passengers.length}</span>
                    <span>{fmt(basePrice * passengers.length)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>Included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: payment form */}
            <div className="flex-1 p-6">
              <h2 className="text-[#f5c800] font-semibold mb-4">Payment Details</h2>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Method selector */}
                {(["credit_card", "card_charge", "bitcoin"] as Method[]).map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all ${
                      method === m
                        ? "border-[#f5c800] bg-[#f5c800]/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m}
                      checked={method === m}
                      onChange={() => setMethod(m)}
                      className="accent-[#f5c800]"
                    />
                    <span className="text-sm text-white font-medium">
                      {METHOD_LABELS[m]}
                    </span>
                    {m === "credit_card" && (
                      <div className="ml-auto flex gap-1 text-xs text-white/40">
                        <span>VISA</span>
                        <span>MC</span>
                        <span>AMEX</span>
                      </div>
                    )}
                    {m === "bitcoin" && <span className="ml-auto text-[#f7931a]">₿</span>}
                  </label>
                ))}

                {/* Card fields */}
                {method !== "bitcoin" && (
                  <div className="flex flex-col gap-3 mt-2">
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="Card Number"
                      required
                      maxLength={19}
                      className={inputCls}
                      aria-label="Card number"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                          setExpiry(v);
                        }}
                        placeholder="MM/YY"
                        required
                        maxLength={5}
                        className={inputCls}
                        aria-label="Expiry date"
                      />
                      <input
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="CVV"
                        required
                        type="password"
                        maxLength={4}
                        className={inputCls}
                        aria-label="CVV"
                      />
                    </div>
                    <input
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Cardholder Name"
                      required
                      className={inputCls}
                      aria-label="Cardholder name"
                    />
                    <p className="text-xs text-white/40 italic">
                      Test: use card ending 0000 to simulate a declined payment.
                    </p>
                  </div>
                )}

                {method === "bitcoin" && (
                  <div className="mt-2 rounded-xl p-4 bg-[#f7931a]/10 border border-[#f7931a]/20 text-sm text-white/70">
                    Bitcoin payment is simulated. Click Complete Booking to proceed.
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-white/40 text-lg">🔒</span>
                  <Button type="submit" fullWidth isLoading={isLoading}>
                    Complete Booking
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
