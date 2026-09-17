"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { useSeats } from "@/hooks/use-seats";
import "./page.css";

// ─── Aisle split helper ──────────────────────────────────────────────────────
/**
 * Compute the column index after which an aisle gap should be drawn.
 *
 * Layout rules (derived from column count, not cabin name):
 *   6 columns  →  A B C | D E F  (split after index 2)
 *   4 columns  →  A B | C D      (split after index 1)
 *   other      →  split after Math.floor(len/2) - 1  (graceful fallback)
 */
function aisleAfterIndex(columns: string[]): number {
  const len = columns.length;
  if (len === 6) return 2;
  if (len === 4) return 1;
  return Math.floor(len / 2) - 1;
}

// ─── SeatCell ────────────────────────────────────────────────────────────────

interface SeatCellProps {
  seatNumber: string;
  columnLetter: string;
  isOccupied: boolean;
  isSelected: boolean;
  onClick: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}

function SeatCell({
  seatNumber,
  columnLetter,
  isOccupied,
  isSelected,
  onClick,
  t,
}: SeatCellProps) {
  const getStyle = (): { bg: string; border: string; cursor: string; label: string } => {
    if (isOccupied)  return { bg: "#374151", border: "#374151", cursor: "cursor-not-allowed", label: t.booking.seat.status.occupied };
    if (isSelected)  return { bg: "#f5c800", border: "#c9a200", cursor: "cursor-pointer",    label: t.booking.seat.status.selected };
    return            { bg: "#f9fafb", border: "#e5e7eb", cursor: "cursor-pointer",           label: t.booking.seat.status.available };
  };

  const { bg, border, cursor, label } = getStyle();

  return (
    <button
      onClick={isOccupied ? undefined : onClick}
      disabled={isOccupied}
      title={`Seat ${seatNumber} — ${label}`}
      aria-label={`Seat ${seatNumber} ${label}`}
      className={`w-8 h-8 rounded-md text-xs font-semibold transition-all duration-150 ${cursor} ${
        isOccupied ? "opacity-50" : "hover:opacity-90 hover:scale-105"
      }`}
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        color: isSelected ? "#111827" : isOccupied ? "#9ca3af" : "#374151",
      }}
    >
      {columnLetter}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SeatSelectionPage() {
  const router = useRouter();
  const { selectedLegs, cabinClass, selectedSeats, setSelectedSeats, passengerCount } =
    useBookingContext();
  const { layout, occupiedSeats, isLoading, error, fetchSeatMap } = useSeats();
  const { t } = useTranslation();

  const [currentLegIndex, setCurrentLegIndex] = useState(0);

  // Fetch seat layout when the leg or cabin changes
  useEffect(() => {
    if (!selectedLegs || selectedLegs.length === 0 || !cabinClass) {
      router.replace("/");
      return;
    }
    fetchSeatMap(selectedLegs[currentLegIndex].id, cabinClass);
  }, [selectedLegs, cabinClass, fetchSeatMap, router, currentLegIndex]);

  // Current leg's selected seat numbers (string[])
  const currentLegSeats: string[] = selectedSeats[currentLegIndex] ?? [];

  function handleToggle(seatNumber: string) {
    const alreadySelected = currentLegSeats.includes(seatNumber);
    if (!alreadySelected && currentLegSeats.length >= passengerCount) return; // max reached

    const newLegSeats = alreadySelected
      ? currentLegSeats.filter((s) => s !== seatNumber)
      : [...currentLegSeats, seatNumber];

    const updated = [...selectedSeats];
    updated[currentLegIndex] = newLegSeats;
    setSelectedSeats(updated);
  }

  function handleConfirm() {
    if (currentLegSeats.length === 0) return;
    if (currentLegIndex < selectedLegs.length - 1) {
      setCurrentLegIndex((i) => i + 1);
    } else {
      router.push("/booking/passenger");
    }
  }

  function handleClearSelection() {
    const updated = [...selectedSeats];
    updated[currentLegIndex] = [];
    setSelectedSeats(updated);
  }

  // Build the row list from the layout once it arrives
  const rowNumbers: number[] = [];
  if (layout) {
    for (let r = layout.firstRow; r <= layout.lastRow; r++) {
      rowNumbers.push(r);
    }
  }

  const aisleIdx = layout ? aisleAfterIndex(layout.columns) : 2;
  const leftCols  = layout?.columns.slice(0, aisleIdx + 1) ?? [];
  const rightCols = layout?.columns.slice(aisleIdx + 1) ?? [];

  return (
    <div className="min-h-dvh flex flex-col seat-page-container">
      <Header variant="glass" />

      <main className="flex-1 flex flex-col items-center pt-20 pb-6 px-4">
        {/* Title + stepper */}
        <div className="text-center mb-6 px-8 py-4 rounded-2xl seat-title-card">
          <h1 className="text-xl font-bold text-[#111827]">X-Fly Anyway</h1>
          <p className="text-sm text-[#6b7280] mb-2">
            {t.booking.seat.seatSelection}{" "}
            {selectedLegs.length > 1
              ? `(Leg ${currentLegIndex + 1} of ${selectedLegs.length})`
              : ""}
          </p>
          <BookingStepper currentLabel={t.booking.seat.seatsCurrent} variant="light" />
        </div>

        <div className="flex gap-6 w-full max-w-5xl items-start">
          {/* Seat map */}
          <div className="flex-1 rounded-3xl p-6 overflow-auto seat-map-container">
            {isLoading && <LoadingState message={t.booking.seat.loading} />}
            {!isLoading && error && (
              <ErrorState
                message={error}
                onRetry={() =>
                  selectedLegs &&
                  cabinClass &&
                  fetchSeatMap(selectedLegs[currentLegIndex].id, cabinClass)
                }
              />
            )}
            {!isLoading && !error && !layout && (
              <EmptyState message={t.booking.seat.noSeats} />
            )}

            {layout && (
              <>
                {/* Column headers — left block */}
                <div className="flex items-center gap-1 mb-3 justify-center">
                  <div className="w-10 shrink-0" /> {/* row-number gutter */}
                  {leftCols.map((col) => (
                    <div
                      key={`h-${col}`}
                      className="w-8 text-center text-xs font-bold text-[#6b7280]"
                    >
                      {col}
                    </div>
                  ))}
                  <div className="w-4" /> {/* aisle gap */}
                  {rightCols.map((col) => (
                    <div
                      key={`h-${col}`}
                      className="w-8 text-center text-xs font-bold text-[#6b7280]"
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Seat rows */}
                <div className="flex flex-col gap-1.5">
                  {rowNumbers.map((rowNum) => (
                    <div key={rowNum} className="flex items-center gap-1 justify-center">
                      {/* Row number label */}
                      <div className="w-10 text-right text-xs text-[#9ca3af] pr-2 shrink-0">
                        {rowNum}
                      </div>

                      {/* Left columns */}
                      {leftCols.map((col) => {
                        const seatNumber = `${rowNum}${col}`;
                        return (
                          <SeatCell
                            key={seatNumber}
                            seatNumber={seatNumber}
                            columnLetter={col}
                            isOccupied={occupiedSeats.has(seatNumber)}
                            isSelected={currentLegSeats.includes(seatNumber)}
                            onClick={() => handleToggle(seatNumber)}
                            t={t}
                          />
                        );
                      })}

                      {/* Aisle gap */}
                      <div className="w-4" />

                      {/* Right columns */}
                      {rightCols.map((col) => {
                        const seatNumber = `${rowNum}${col}`;
                        return (
                          <SeatCell
                            key={seatNumber}
                            seatNumber={seatNumber}
                            columnLetter={col}
                            isOccupied={occupiedSeats.has(seatNumber)}
                            isSelected={currentLegSeats.includes(seatNumber)}
                            onClick={() => handleToggle(seatNumber)}
                            t={t}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-5 justify-center flex-wrap text-xs text-[#6b7280]">
                  {[
                    { color: "#f9fafb", border: "#e5e7eb", label: t.booking.seat.legend.available },
                    { color: "#f5c800", border: "#c9a200", label: t.booking.seat.legend.selected },
                    { color: "#374151", border: "#374151", label: t.booking.seat.legend.occupied },
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
            <h2 className="text-base font-bold text-[#111827] mb-4">
              {t.booking.seat.yourSelection}
            </h2>

            {currentLegSeats.length === 0 ? (
              <p className="text-sm text-[#9ca3af] mb-6">
                {t.booking.seat.selectUpTo} {passengerCount} {t.booking.seat.seat}
                {passengerCount > 1 ? "s" : ""}
              </p>
            ) : (
              <ul className="flex flex-col gap-2 mb-4">
                {currentLegSeats.map((seatNumber) => (
                  <li key={seatNumber} className="flex justify-between text-sm">
                    <span className="font-semibold text-[#111827]">
                      {t.booking.seat.seat} {seatNumber}
                    </span>
                    <span className="text-[#6b7280] capitalize">{cabinClass}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-[#e5e7eb] pt-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">{t.booking.seat.selected}</span>
                <span className="font-bold text-[#111827]">
                  {currentLegSeats.length} / {passengerCount}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleConfirm}
                disabled={currentLegSeats.length === 0}
                fullWidth
              >
                {currentLegIndex < selectedLegs.length - 1
                  ? "Next Flight →"
                  : t.booking.seat.confirmSeats}
              </Button>
              <Button
                variant="ghost"
                onClick={handleClearSelection}
                fullWidth
                className="text-[#6b7280] text-sm"
              >
                {t.booking.seat.changeSelection}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
