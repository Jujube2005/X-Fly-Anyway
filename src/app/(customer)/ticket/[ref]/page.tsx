"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import type { ETicket } from "@/types/ticket";

// Simple QR-code-like square using deterministic pattern
function QRPlaceholder({ data }: { data: string }) {
  const size = 10;
  const seed = data.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const grid = Array.from({ length: size * size }, (_, i) => ((seed * (i + 7) * 31) % 17) < 8);

  return (
    <div
      className="w-24 h-24 p-1 bg-white rounded-lg"
      style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: "1px" }}
      aria-label="QR Code"
      role="img"
    >
      {grid.map((filled, i) => (
        <div key={i} className={filled ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

export default function TicketPage() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<ETicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) return;
    fetch(`/api/tickets/${encodeURIComponent(ref)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Ticket not found"))))
      .then((data) => { setTicket(data); setIsLoading(false); })
      .catch((err) => { setError(err.message); setIsLoading(false); });
  }, [ref]);

  function handlePrint() {
    window.print();
  }

  const passenger = ticket?.booking?.passengers?.[0];
  const passengerName = passenger
    ? `${passenger.firstName} ${passenger.lastName}`.toUpperCase()
    : "—";

  const flight = ticket?.booking?.flight;
  const flightDate = flight?.departureAt
    ? new Date(flight.departureAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase()
    : "—";

  const seats = ticket?.booking?.seats ?? [];
  const seatLabel = seats.length > 0 ? seats.map((s: any) => s.seatNumber).join(", ") : "—";

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse at bottom, #1e3a5f 0%, #0d1b2a 60%, #000 100%)",
      }}
    >
      {isLoading && <LoadingState message="Loading your ticket..." />}

      {!isLoading && error && (
        <ErrorState
          message={error}
          onRetry={() => router.back()}
        />
      )}

      {!isLoading && ticket && (
        <div
          className="w-full max-w-lg rounded-3xl overflow-hidden print:shadow-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 16px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* Ticket header */}
          <div className="px-8 pt-7 pb-5 border-b border-white/10 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* X-Fly logo mark */}
              <div className="w-10 h-10 rounded-xl bg-[#f5c800] flex items-center justify-center">
                <span className="text-[#111827] font-black text-sm">X</span>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">X-Fly</p>
                <p className="text-white/60 text-xs leading-tight">Anyway</p>
              </div>
            </div>
            <span className="text-white/30 text-xl">|</span>
            <span className="text-white/80 text-sm font-medium tracking-wide">
              Boarding Pass
            </span>
          </div>

          {/* Ticket body */}
          <div className="px-8 py-6 flex gap-6">
            {/* Left: passenger + flight info */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                  Passenger
                </p>
                <p className="text-xl font-bold text-white">{passengerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                    Flight
                  </p>
                  <p className="text-base font-bold text-[#f5c800]">
                    {flight?.flightNumber ?? ref}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                    Date
                  </p>
                  <p className="text-base font-bold text-[#f5c800]">{flightDate}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                    From
                  </p>
                  <p className="text-base font-bold text-white">
                    {flight?.originCode ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                    Seat
                  </p>
                  <p className="text-base font-bold text-[#f5c800]">{seatLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                    To
                  </p>
                  <p className="text-base font-bold text-white">
                    {flight?.destinationCode ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
                    Class
                  </p>
                  <p className="text-base font-bold text-[#f5c800] capitalize">
                    {ticket?.booking?.cabinClass?.replace("_", " ") ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: QR code */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <QRPlaceholder data={ticket.ticketCode ?? ref ?? "TICKET"} />
              <p className="text-xs text-white/30 font-mono">
                {(ticket.ticketCode ?? ref ?? "").slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Dashed tear line */}
          <div className="mx-6 border-t border-dashed border-white/20" />

          {/* Actions */}
          <div className="px-8 py-5 flex flex-col gap-3 print:hidden">
            <Button fullWidth onClick={handlePrint}>
              🖨 Print E-Ticket
            </Button>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-white/50 hover:text-white transition-colors underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
