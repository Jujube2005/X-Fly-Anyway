"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import type { PaymentMethod } from "@/types/payment";
import "./page.css";

type Method = "credit_card" | "card_charge" | "bitcoin";

const inputCls =
  "glass-input w-full px-4 py-3 text-sm text-[#111827] placeholder:text-slate-600 appearance-none";

export default function PaymentPage() {
  const router = useRouter();
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!selectedLegs || selectedLegs.length === 0 || !contact || !cabinClass) {
      router.replace("/");
    }
  }, [selectedLegs, contact, cabinClass, router]);

  if (!selectedLegs || selectedLegs.length === 0 || !contact || !cabinClass) {
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
    <div 
      className="min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url("/images/BG/airport.png")' }}
    >
      <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-dvh">
        <Header variant="glass" />

        <main className="flex-1 pt-24 pb-12 px-4 flex items-start justify-center">
          <div className="w-full max-w-3xl glass-card overflow-hidden">
            {/* Header bar */}
            <div className="px-8 py-5 border-b border-white/30 flex items-center gap-4 bg-white/10">
              <span className="text-lg font-bold text-[#111827]">X-Fly Anyway</span>
              <span className="text-slate-400">|</span>
              <span className="text-brand-yellow-dark font-semibold drop-shadow-sm">
                {t.booking?.payment?.paymentInfo ?? "Payment Information"}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-0">
              {/* Left: flight summary */}
              <div className="lg:w-64 p-6 border-b lg:border-b-0 lg:border-r border-white/30 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#f5c800] text-xl">✈</span>
                </div>
                <div className="flex flex-col gap-4 mb-4">
                  {selectedLegs.map((leg) => (
                    <div key={leg.id}>
                      <p className="text-[#111827] font-bold text-sm mb-1">
                        {t.booking?.payment?.flight ?? "Flight"} {leg.flightNumber} — {leg.origin.airport_code} {t.booking?.payment?.to ?? "to"} {leg.destination.airport_code}
                      </p>
                      <p className="text-slate-600 font-medium text-xs">
                        {new Date(leg.departureAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/40 pt-4">
                  <p className="text-xs text-slate-700 font-medium mb-1">{t.booking?.payment?.total ?? "Total"}</p>
                  <p className="text-2xl font-bold text-[#111827]">{fmt(totalAmount)}</p>
                  <div className="mt-3 text-xs text-slate-600 font-medium flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>{t.booking?.payment?.baseFare ?? "Base Fare"} × {passengers.length}</span>
                      <span>{fmt(basePrice * passengers.length)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.booking?.payment?.taxesFees ?? "Taxes & Fees"}</span>
                      <span className="text-emerald-700">{t.booking?.payment?.included ?? "Included"}</span>
                    </div>
                  </div>
                </div>
              </div>

            {/* Right: payment form */}
            <div className="flex-1 p-6">
              <h2 className="text-[#111827] font-bold mb-4 drop-shadow-sm">
                {t.booking?.payment?.paymentDetails ?? "Payment Details"}
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Method selector */}
                {(
                  [
                    { key: "credit_card", label: t.booking?.payment?.creditCard ?? "Credit Card" },
                    { key: "card_charge", label: t.booking?.payment?.cardCharge ?? "Card Charge (Direct Debit)" },
                    { key: "bitcoin", label: t.booking?.payment?.bitcoin ?? "Bitcoin" },
                  ] as const
                ).map(({ key: m, label }) => (
                  <label
                    key={m}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all ${
                      method === m
                        ? "border-[#f5c800] bg-white/40 shadow-sm"
                        : "border-white/30 bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m}
                      checked={method === m}
                      onChange={() => setMethod(m as Method)}
                      className="accent-[#f5c800]"
                    />
                    <span className={`text-sm font-medium ${method === m ? "text-[#b48c00]" : "text-[#111827]"}`}>
                      {label}
                    </span>
                    {m === "credit_card" && (
                      <div className="ml-auto flex gap-1 text-xs text-slate-500 font-semibold">
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
                      placeholder={t.booking?.payment?.cardNumber ?? "Card Number"}
                      required
                      maxLength={19}
                      className={inputCls}
                      aria-label={t.booking?.payment?.cardNumber ?? "Card number"}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                          setExpiry(v);
                        }}
                        placeholder={t.booking?.payment?.expiry ?? "MM/YY"}
                        required
                        maxLength={5}
                        className={inputCls}
                        aria-label={t.booking?.payment?.expiry ?? "Expiry date"}
                      />
                      <input
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder={t.booking?.payment?.cvv ?? "CVV"}
                        required
                        type="password"
                        maxLength={4}
                        className={inputCls}
                        aria-label={t.booking?.payment?.cvv ?? "CVV"}
                      />
                    </div>
                    <input
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder={t.booking?.payment?.name ?? "Cardholder Name"}
                      required
                      className={inputCls}
                      aria-label={t.booking?.payment?.name ?? "Cardholder name"}
                    />
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                      <span className="italic">
                        {t.booking?.payment?.testDeclineNotice ?? "Test: card ending 0000 simulates decline"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber("4532 1234 5678 9010");
                          setExpiry("12/28");
                          setCvv("123");
                          setCardHolder("John Doe");
                        }}
                        className="text-brand-yellow-dark hover:underline font-bold transition-colors"
                      >
                        {t.booking?.payment?.autoFillValidCard ?? "Auto-fill Valid Card"}
                      </button>
                    </div>
                  </div>
                )}

                {method === "bitcoin" && (
                  <div className="mt-2 rounded-xl p-4 bg-[#f7931a]/10 border border-[#f7931a]/20 text-sm text-[#111827] font-medium backdrop-blur-sm">
                    {t.booking?.payment?.bitcoinSimNotice ?? "Bitcoin payment is simulated. Click Complete Booking to proceed."}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-slate-400 text-lg">🔒</span>
                  <Button type="submit" fullWidth isLoading={isLoading} className="bg-[#f5c800] text-slate-950 hover:bg-[#e6bb00] shadow-md border-0 text-base font-bold">
                    {isLoading
                      ? (t.booking?.payment?.processing ?? "Processing...")
                      : (t.booking?.payment?.completeBooking ?? "Complete Booking")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
