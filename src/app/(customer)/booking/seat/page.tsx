"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useSeats } from "@/hooks/use-seats";
import type { Seat } from "@/types/seat";
import "./page.css";

function SeatCell({ seat, isSelected, onClick }: { seat: Seat; isSelected: boolean; onClick: () => void }) {
  const getStyle = (): { bg: string; border: string; cursor: string; label: string } => {
    if (seat.status === "occupied") return { bg: "#374151", border: "#374151", cursor: "cursor-not-allowed", label: "Occupied" };
    if (seat.status === "blocked") return { bg: "#6b7280", border: "#6b7280", cursor: "cursor-not-allowed", label: "Blocked" };
    if (isSelected) return { bg: "#f5c800", border: "#c9a200", cursor: "cursor-pointer", label: "Selected" };
    return { bg: "#f9fafb", border: "#e5e7eb", cursor: "cursor-pointer", label: "Available" };
  };

  const { bg, border, cursor, label } = getStyle();
  const isDisabled = seat.status === "occupied" || seat.status === "blocked";

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={`Seat ${seat.seatNumber} — ${label}`}
      aria-label={`Seat ${seat.seatNumber} ${label}`}
      className={`w-8 h-8 rounded-md text-xs font-semibold transition-all duration-150 ${cursor} ${
        isDisabled ? "opacity-50" : "hover:opacity-90 hover:scale-105"
      }`}
      style={{ background: bg, border: `1.5px solid ${border}`, color: isSelected ? "#111827" : isDisabled ? "#9ca3af" : "#374151" }}
    >
      {seat.columnLetter}
    </button>
  );
}

export default function SeatSelectionPage() {
  const router = useRouter();
  const { selectedFlight, cabinClass, selectedSeats, setSelectedSeats, passengerCount } = useBookingContext();
  const { seatMap, isLoading, error, fetchSeatMap, toggleSeat } = useSeats();

  useEffect(() => {
    if (!selectedFlight || !cabinClass) { router.replace("/"); return; }
    fetchSeatMap(selectedFlight.id, cabinClass);
  }, [selectedFlight, cabinClass, fetchSeatMap, router]);

  // Sync useSeats selected with context
  function handleToggle(seat: Seat) {
    const alreadySelected = selectedSeats.some((s) => s.id === seat.id);
    if (!alreadySelected && selectedSeats.length >= passengerCount) return; // max reached
    toggleSeat(seat);
    setSelectedSeats(
      alreadySelected
        ? selectedSeats.filter((s) => s.id !== seat.id)
        : [...selectedSeats, seat]
    );
  }

  function handleConfirm() {
    if (selectedSeats.length === 0) return;
    router.push("/booking/passenger");
  }

  const groupedByRow = seatMap
    ? seatMap.seats.reduce<Record<number, Seat[]>>((acc, seat) => {
        if (!acc[seat.rowNumber]) acc[seat.rowNumber] = [];
        acc[seat.rowNumber].push(seat);
        return acc;
      }, {})
    : {};

  const totalSeats = selectedSeats.length;

  return (
    <div className="min-h-dvh flex flex-col seat-page-container">
      <Header variant="glass" />

      <main className="flex-1 flex flex-col items-center pt-20 pb-6 px-4">
        {/* Title + stepper */}
        <div className="text-center mb-6 px-8 py-4 rounded-2xl seat-title-card">
          <h1 className="text-xl font-bold text-[#111827]">X-Fly Anyway</h1>
          <p className="text-sm text-[#6b7280] mb-2">Seat Selection</p>
          <BookingStepper currentLabel="Seats (Current)" variant="light" />
        </div>

        <div className="flex gap-6 w-full max-w-5xl items-start">
          {/* Seat map */}
          <div className="flex-1 rounded-3xl p-6 overflow-auto seat-map-container">
            {isLoading && <LoadingState message="Loading seat map..." />}
            {!isLoading && error && <ErrorState message={error} onRetry={() => selectedFlight && cabinClass && fetchSeatMap(selectedFlight.id, cabinClass)} />}
            {!isLoading && !error && !seatMap && <EmptyState message="No seats available." />}

            {seatMap && (
              <>
                {/* Column headers */}
                <div className="flex items-center gap-1 mb-3 justify-center">
                  <div className="w-10 shrink-0" /> {/* row number */}
                  {seatMap.columns.slice(0, 3).map((col) => (
                    <div key={`h-${col}`} className="w-8 text-center text-xs font-bold text-[#6b7280]">{col}</div>
                  ))}
                  <div className="w-4" /> {/* aisle gap */}
                  {seatMap.columns.slice(3).map((col) => (
                    <div key={`h-${col}`} className="w-8 text-center text-xs font-bold text-[#6b7280]">{col}</div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  {Object.entries(groupedByRow)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([rowNum, seats]) => {
                      const sorted = [...seats].sort((a, b) => a.columnLetter.localeCompare(b.columnLetter));
                      const left = sorted.filter((s) => ["A", "B", "C"].includes(s.columnLetter));
                      const right = sorted.filter((s) => ["D", "E", "F"].includes(s.columnLetter));

                      return (
                        <div key={rowNum} className="flex items-center gap-1 justify-center">
                          <div className="w-10 text-right text-xs text-[#9ca3af] pr-2 shrink-0">{rowNum}</div>
                          {left.map((seat) => (
                            <SeatCell
                              key={seat.id}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s.id === seat.id)}
                              onClick={() => handleToggle(seat)}
                            />
                          ))}
                          <div className="w-4" />
                          {right.map((seat) => (
                            <SeatCell
                              key={seat.id}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s.id === seat.id)}
                              onClick={() => handleToggle(seat)}
                            />
                          ))}
                        </div>
                      );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-5 justify-center flex-wrap text-xs text-[#6b7280]">
                  {[
                    { color: "#f9fafb", border: "#e5e7eb", label: "Available" },
                    { color: "#f5c800", border: "#c9a200", label: "Selected" },
                    { color: "#374151", border: "#374151", label: "Occupied" },
                    { color: "#6b7280", border: "#6b7280", label: "Blocked" },
                  ].map(({ color, border, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: color, border: `1.5px solid ${border}` }}
                      />
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Selection panel */}
          <div className="w-64 shrink-0 rounded-3xl p-5 sticky top-24 seat-selection-panel">
            <h2 className="text-base font-bold text-[#111827] mb-4">Your Selection</h2>

            {selectedSeats.length === 0 ? (
              <p className="text-sm text-[#9ca3af] mb-6">
                Select up to {passengerCount} seat{passengerCount > 1 ? "s" : ""}
              </p>
            ) : (
              <ul className="flex flex-col gap-2 mb-4">
                {selectedSeats.map((seat) => (
                  <li key={seat.id} className="flex justify-between text-sm">
                    <span className="font-semibold text-[#111827]">Seat {seat.seatNumber}</span>
                    <span className="text-[#6b7280] capitalize">{seat.cabinClass}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-[#e5e7eb] pt-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Selected</span>
                <span className="font-bold text-[#111827]">
                  {totalSeats} / {passengerCount}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleConfirm}
                disabled={totalSeats === 0}
                fullWidth
              >
                Confirm Seats
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedSeats([]);
                }}
                fullWidth
                className="text-[#6b7280] text-sm"
              >
                Change Selection
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
