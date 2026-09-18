"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import QRCode from "qrcode";
import type { ETicket } from "@/types/ticket";
import type { Passenger } from "@/types/passenger";
import "./page.css";

// Authentic, scannable Airline E-Ticket QR Code component
function AirlineQRCode({ data }: { data: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(data, {
      margin: 1,
      width: 256,
      color: {
        dark: "#0b192c",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [data]);

  return (
    <div className="p-2 bg-white rounded-2xl shadow-lg border border-white/20 flex items-center justify-center">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="E-Ticket Verification QR Code"
          className="w-20 h-20 md:w-24 md:h-24 block object-contain"
        />
      ) : (
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 animate-pulse rounded-xl" />
      )}
    </div>
  );
}

function formatFlightDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}

function formatFlightTime(dateStr?: string) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return null;
  }
}

function formatPassengerName(p?: Passenger) {
  if (!p) return "—";
  const title = p.title ? `${p.title}. ` : "";
  const name = `${p.firstName} ${p.lastName}`.trim();
  return (title + name).toUpperCase() || "PASSENGER";
}

function getPassengerSeat(ticket: ETicket, pIdx: number): string {
  const seatNumbers = ticket.booking?.seatNumbers;
  const flights = ticket.flights || [];

  if (seatNumbers && seatNumbers.length > 0) {
    if (seatNumbers.length === 1) {
      // Direct flight
      const seat = seatNumbers[0]?.[pIdx];
      return seat || "Unassigned";
    } else {
      // Connecting flights
      const legSeats = seatNumbers.map((leg, legIdx) => {
        const flightNum = flights[legIdx]?.flightNumber || `Leg ${legIdx + 1}`;
        const seat = leg?.[pIdx] || "—";
        return `${flightNum}: ${seat}`;
      });
      return legSeats.join(" • ");
    }
  }

  // Fallback to booking.seats
  const fallbackSeats = ticket.booking?.seats;
  if (fallbackSeats && fallbackSeats[pIdx]?.seatNumber) {
    return fallbackSeats[pIdx].seatNumber;
  }

  return "Unassigned";
}

export default function TicketPage() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<ETicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<number | "all">("all");

  const isInvalidRef = !ref || ref === "undefined";
  const error = isInvalidRef ? (t.ticket?.invalidRef ?? "Invalid booking reference") : fetchError;

  useEffect(() => {
    if (!ref || ref === "undefined") return;

    let isMounted = true;
    fetch(`/api/tickets/${encodeURIComponent(ref)}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || (t.ticket?.notFound ?? "Ticket not found"));
        return json;
      })
      .then((data) => {
        if (!isMounted) return;
        const tkt: ETicket = data.ticket ?? data;
        setTicket(tkt);
        setIsLoading(false);
        // Default to "all" if multi-passenger, or index 0 if single passenger
        if ((tkt.booking?.passengers?.length ?? 0) <= 1) {
          setSelectedPassenger(0);
        } else {
          setSelectedPassenger("all");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setFetchError(err.message);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ref, t]);

  function handlePrint() {
    window.print();
  }

  const bookingRef = ticket?.booking?.reference ?? ref ?? "—";
  const ticketCode = ticket?.ticketCode ?? `ETK-${bookingRef}`;
  const rawClass = ticket?.booking?.cabinClass;
  const cabinClass = (rawClass && t.search?.cabinClass?.[rawClass as keyof typeof t.search.cabinClass])
    || ticket?.booking?.cabinClass?.replace("_", " ")
    || "economy";
  const passengers = ticket?.booking?.passengers ?? [];
  const flights = ticket?.flights ?? [];
  const primaryFlight = ticket?.booking?.flight ?? (flights[0] ? {
    flightNumber: flights[0].flightNumber,
    originCode: flights[0].origin?.airport_code ?? "—",
    originCity: flights[0].origin?.city ?? "—",
    originName: flights[0].origin?.name ?? "—",
    destinationCode: flights[0].destination?.airport_code ?? "—",
    destinationCity: flights[0].destination?.city ?? "—",
    destinationName: flights[0].destination?.name ?? "—",
    departureAt: flights[0].departureAt,
    arrivalAt: flights[0].arrivalAt,
  } : null);

  const displayedPassengers = passengers.length > 0
    ? (selectedPassenger === "all" ? passengers : [passengers[selectedPassenger] || passengers[0]])
    : [{ firstName: "Passenger", lastName: "" } as Passenger];

  const isPageLoading = isInvalidRef ? false : isLoading;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 ticket-page-container">
      {isPageLoading && <LoadingState message={t.ticket?.loading ?? "Loading your e-ticket..."} />}

      {!isPageLoading && error && (
        <ErrorState
          message={error}
          onRetry={() => router.back()}
        />
      )}

      {!isPageLoading && !error && ticket && (
        <div className="w-full max-w-xl flex flex-col gap-6">
          {/* Multi-passenger selection tabs (screen only) */}
          {passengers.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden self-center">
              <button
                type="button"
                onClick={() => setSelectedPassenger("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedPassenger === "all"
                    ? "bg-[#f5c800] text-[#111827] shadow-lg shadow-[#f5c800]/20 font-bold"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {t.ticket?.allPassengers ?? "All Passengers"} ({passengers.length})
              </button>
              {passengers.map((p, idx) => {
                const isSelected = selectedPassenger === idx;
                return (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setSelectedPassenger(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-[#f5c800] text-[#111827] shadow-lg shadow-[#f5c800]/20 font-bold"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {idx + 1}. {p.firstName} {p.lastName}
                  </button>
                );
              })}
            </div>
          )}

          {/* Passenger E-Ticket Cards */}
          {displayedPassengers.map((p, displayIndex) => {
            const passengerIndex = selectedPassenger === "all"
              ? displayIndex
              : (typeof selectedPassenger === "number" ? selectedPassenger : 0);
            const passengerName = formatPassengerName(p);
            const passengerSeat = getPassengerSeat(ticket, passengerIndex);

            return (
              <div
                key={p.id || passengerIndex}
                className="rounded-3xl overflow-hidden print:shadow-none ticket-card-glass ticket-perforation flex flex-col"
              >
                {/* 1. Ticket Header */}
                <div className="px-6 md:px-8 pt-6 pb-4 border-b border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* X-Fly logo mark */}
                    <div className="w-10 h-10 rounded-xl bg-[#f5c800] flex items-center justify-center shrink-0 shadow-md">
                      <span className="text-[#111827] font-black text-base">X</span>
                    </div>
                    <div>
                      <p className="text-white font-black text-sm leading-tight tracking-wide">
                        X-Fly <span className="text-[#f5c800]">Anyway</span>
                      </p>
                      <p className="text-white/50 text-[11px] leading-tight">
                        {t.ticket?.receipt ?? "Electronic Ticket Receipt"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      {t.ticket?.confirmed ?? "Confirmed"}
                    </span>
                    <span className="text-white/90 text-sm font-semibold tracking-wide hidden sm:inline">
                      {t.ticket?.title ?? "E-Ticket"}
                    </span>
                  </div>
                </div>

                {/* 2. Reference & Ticket Metadata Strip */}
                <div className="px-6 md:px-8 py-3 bg-white/5 border-b border-white/10 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-white/50 uppercase tracking-wider text-[10px] block mb-0.5">
                      {t.ticket?.bookingRef ?? "Booking Reference (PNR)"}
                    </span>
                    <span className="text-base md:text-lg font-black text-[#f5c800] font-mono tracking-wider">
                      {bookingRef}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/50 uppercase tracking-wider text-[10px] block mb-0.5">
                      {t.ticket?.ticketNumber ?? "E-Ticket No."}
                    </span>
                    <span className="text-sm font-semibold text-white/90 font-mono">
                      {ticketCode}
                    </span>
                    {ticket.issuedAt && (
                      <span className="text-[10px] text-white/40 block mt-0.5">
                        {t.ticket?.issued ?? "Issued"}: {formatFlightDate(ticket.issuedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Flight Segments & Route Info */}
                <div className="px-6 md:px-8 pt-5 pb-3">
                  {flights.length > 1 ? (
                    // Connecting flights: display each leg clearly
                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">
                        {t.ticket?.flightSegments ?? "Flight Segments (Connecting Flight)"}
                      </span>
                      {flights.map((leg, legIdx) => {
                        const legDepartureDate = formatFlightDate(leg.departureAt);
                        const legDepTime = formatFlightTime(leg.departureAt);
                        const legArrTime = formatFlightTime(leg.arrivalAt);
                        const legSeat = ticket.booking?.seatNumbers?.[legIdx]?.[passengerIndex] || (t.ticket?.unassigned ?? "—");

                        return (
                          <div
                            key={leg.id || legIdx}
                            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#f5c800]">
                                {t.ticket?.flight ?? "Flight"} {leg.flightNumber}
                              </span>
                              <span className="text-white/60">{legDepartureDate}</span>
                              <span className="text-white/90 font-mono">{t.ticket?.seat ?? "Seat"}: <strong className="text-[#f5c800]">{legSeat}</strong></span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-black text-white">
                                  {leg.origin?.airport_code || "—"}
                                </span>
                                <p className="text-xs text-white/60">{leg.origin?.city}</p>
                                {legDepTime && (
                                  <p className="text-xs font-semibold text-[#f5c800]">{legDepTime}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-6 h-[1px] bg-white/20" />
                                <span className="text-xs text-[#f5c800]">✈</span>
                                <div className="w-6 h-[1px] bg-white/20" />
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-black text-white">
                                  {leg.destination?.airport_code || "—"}
                                </span>
                                <p className="text-xs text-white/60">{leg.destination?.city}</p>
                                {legArrTime && (
                                  <p className="text-xs font-semibold text-[#f5c800]">{legArrTime}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Single / Direct flight
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-2xl md:text-3xl font-black text-white tracking-wide">
                          {primaryFlight?.originCode ?? "—"}
                        </span>
                        <p className="text-xs text-white/60">
                          {primaryFlight?.originCity ?? primaryFlight?.originName ?? (t.ticket?.departure ?? "Departure")}
                        </p>
                        {primaryFlight?.departureAt && formatFlightTime(primaryFlight.departureAt) && (
                          <p className="text-xs md:text-sm font-bold text-[#f5c800] mt-0.5">
                            {formatFlightTime(primaryFlight.departureAt)}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <span className="text-xs font-bold text-[#f5c800] tracking-wider mb-1">
                          {primaryFlight?.flightNumber ?? "—"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 md:w-12 h-[1px] bg-white/25" />
                          <span className="text-sm text-[#f5c800]">✈</span>
                          <div className="w-8 md:w-12 h-[1px] bg-white/25" />
                        </div>
                        <span className="text-[11px] text-white/50 mt-1">
                          {formatFlightDate(primaryFlight?.departureAt)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl md:text-3xl font-black text-white tracking-wide">
                          {primaryFlight?.destinationCode ?? "—"}
                        </span>
                        <p className="text-xs text-white/60">
                          {primaryFlight?.destinationCity ?? primaryFlight?.destinationName ?? (t.ticket?.arrival ?? "Arrival")}
                        </p>
                        {primaryFlight?.arrivalAt && formatFlightTime(primaryFlight.arrivalAt) && (
                          <p className="text-xs md:text-sm font-bold text-[#f5c800] mt-0.5">
                            {formatFlightTime(primaryFlight.arrivalAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Passenger Details & Seat Grid */}
                <div className="px-6 md:px-8 py-4 flex gap-6 items-center">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
                        {t.ticket?.passenger ?? "Passenger"}
                      </p>
                      <p className="text-base font-bold text-white leading-tight">
                        {passengerName}
                      </p>
                      {passengers.length > 1 && (
                        <p className="text-[10px] text-white/40 mt-0.5">
                          {(t.ticket?.passengerNOf ?? "Passenger {current} of {total}")
                            .replace("{current}", String(passengerIndex + 1))
                            .replace("{total}", String(passengers.length))}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
                        {t.ticket?.seat ?? "Seat"}
                      </p>
                      <p className="text-base font-bold text-[#f5c800]">
                        {passengerSeat}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
                        {t.ticket?.class ?? "Class"}
                      </p>
                      <p className="text-sm font-bold text-white capitalize">
                        {cabinClass}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
                        {t.ticket?.flightDate ?? "Flight Date"}
                      </p>
                      <p className="text-sm font-semibold text-white/90">
                        {formatFlightDate(primaryFlight?.departureAt)}
                      </p>
                    </div>
                  </div>

                  {/* Real Airline QR Code section */}
                  <div className="shrink-0 flex flex-col items-center gap-2 self-center">
                    <AirlineQRCode
                      data={`XFA//${ticketCode}//${bookingRef}//${p.firstName || ""}_${p.lastName || ""}//SEAT:${passengerSeat}`}
                    />
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-white/50 block font-semibold tracking-wider">
                        {ticketCode}
                      </span>
                      <span className="text-[9px] text-white/30 block tracking-tight">
                        {t.ticket?.scanToVerify ?? "Scan to verify electronic ticket"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashed tear line indicator */}
                <div className="mx-6 my-2 border-t border-dashed border-white/20" />

                {/* Ticket Footer / Verification Note */}
                <div className="px-6 md:px-8 py-3 bg-white/5 flex items-center justify-between text-[11px] text-white/40">
                  <span>{t.ticket?.mockNotice ?? "Electronic Ticket • Official X-Fly Anyway Record"}</span>
                  <span className="font-mono">{bookingRef}</span>
                </div>
              </div>
            );
          })}

          {/* Actions & Print Options */}
          <div className="flex flex-col gap-3 print:hidden">
            <Button
              fullWidth
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 text-base font-bold py-3.5"
            >
              <span>🖨</span>
              <span>{t.ticket?.downloadPrint ?? "Download / Print E-Ticket"}</span>
            </Button>
            <p className="text-center text-xs text-white/40">
              {t.ticket?.printTip ?? "Tip: In your browser print dialog, select \"Save as PDF\" to download a digital copy."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-white/60 hover:text-white transition-colors underline text-center mt-2"
            >
              {t.ticket?.backHome ?? "Back to Home"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
