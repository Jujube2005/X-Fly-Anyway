"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { useBookingContext } from "@/components/booking/BookingProvider";
import type { Booking } from "@/types/booking";
import "./page.css";

export default function ConfirmationPage() {
  const router = useRouter();
  const { bookingRef, resetBooking } = useBookingContext();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingRef) { router.replace("/"); return; }
    fetch(`/api/bookings/${encodeURIComponent(bookingRef)}`)
      .then((r) => r.json())
      .then((data) => { setBooking(data); setIsLoading(false); })
      .catch(() => { setError("Could not load booking."); setIsLoading(false); });
  }, [bookingRef, router]);

  if (!bookingRef) return null;

  const firstPassenger = booking?.passengers?.[0];
  const passengerName = firstPassenger
    ? `${firstPassenger.title}. ${firstPassenger.firstName} ${firstPassenger.lastName}`
    : "—";

  return (
    <div className="min-h-dvh flex flex-col confirmation-page-container">
      <Header variant="transparent" />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {isLoading && <LoadingState message="Loading your booking..." />}

        {!isLoading && (error || !booking) && (
          <div className="text-center">
            <p className="text-red-300 mb-4">{error ?? "Booking not found."}</p>
            <Button onClick={() => router.push("/")} variant="secondary">
              Back to Home
            </Button>
          </div>
        )}

        {!isLoading && booking && (
          <div className="w-full max-w-lg">
            {/* Checkmark */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#f5c800]/40 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#f5c800]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Sparkles */}
                {["-top-2 -right-2", "-top-2 -left-2", "top-8 -right-5", "top-8 -left-5"].map((pos) => (
                  <span key={pos} className={`absolute ${pos} text-[#f5c800] text-xs`}>✦</span>
                ))}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">
              Booking <span className="text-[#f5c800]">Confirmed!</span>
            </h1>
            <p className="text-center text-white/60 mb-8">
              Your flight is all set. Pack your bags, adventurer!
            </p>

            {/* Reference card */}
            <div className="rounded-3xl p-8 confirmation-card-glass">
              <p className="text-center text-xs text-white/50 uppercase tracking-widest mb-2">
                Booking Reference
              </p>
              <p className="text-center text-3xl font-bold text-[#f5c800] tracking-wider mb-6">
                {booking.reference}
              </p>

              <div className="flex flex-col gap-2 text-sm text-white/80 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/50">Passenger:</span>
                  <span className="font-semibold text-white">{passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Flight:</span>
                  <span className="font-semibold text-white">{booking.flightId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Class:</span>
                  <span className="font-semibold text-white capitalize">
                    {booking.cabinClass?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total Paid:</span>
                  <span className="font-bold text-white">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "THB",
                      maximumFractionDigits: 2,
                    }).format(Number(booking.totalAmount))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href={`/ticket/${encodeURIComponent(booking.reference)}`} className="block">
                  <Button variant="secondary" fullWidth>
                    ⬇ Download E-Ticket
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  fullWidth
                  className="text-white/80"
                  onClick={() => { resetBooking(); router.push("/"); }}
                >
                  🏠 Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
