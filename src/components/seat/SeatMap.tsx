"use client";
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SeatLayout, SeatInfo } from "@/types/seat";
import { SeatCell } from "./SeatCell";

interface SeatMapProps {
  layout: SeatLayout;
  seatsInfo: Record<string, SeatInfo>;
  currentLegSeats: string[];
  allSelectedSeats: string[]; // To know if a seat is selected by another passenger
  onSeatClick: (seatNumber: string) => void;
  maxSeatsReached: boolean;
}

export function SeatMap({
  layout,
  seatsInfo,
  currentLegSeats,
  allSelectedSeats,
  onSeatClick,
  maxSeatsReached
}: SeatMapProps) {
  const { t } = useTranslation();

  const rowNumbers: number[] = [];
  for (let r = layout.firstRow; r <= layout.lastRow; r++) {
    rowNumbers.push(r);
  }

  // Dynamically find aisles based on API data
  const aisleIndices = new Set<number>();
  for (let i = 0; i < layout.columns.length - 1; i++) {
    const colA = layout.columns[i];
    const colB = layout.columns[i + 1];
    for (const rowNum of rowNumbers) {
      const seatA = seatsInfo[`${rowNum}${colA}`];
      const seatB = seatsInfo[`${rowNum}${colB}`];
      if (seatA?.isAisle && seatB?.isAisle) {
        aisleIndices.add(i);
        break;
      }
    }
  }

  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="flex items-center gap-1.5 mb-4 justify-center">
        <div className="w-8 shrink-0" /> {/* row-number gutter */}
        {layout.columns.map((col, colIdx) => (
          <React.Fragment key={`h-${col}`}>
            <div className="w-10 md:w-11 text-center text-xs font-bold text-[#6b7280]">
              {col}
            </div>
            {aisleIndices.has(colIdx) && <div className="w-6 md:w-8" />}
          </React.Fragment>
        ))}
      </div>

      {/* Seat rows */}
      <div className="flex flex-col gap-2">
        {rowNumbers.map((rowNum) => {
          // Determine if this row is an exit row by checking if any seat in this row is marked as exit row
          const isExitRow = layout.columns.some((col) => {
             const seatNum = `${rowNum}${col}`;
             return seatsInfo[seatNum]?.isExitRow;
          });

          return (
            <div key={rowNum} className="relative flex items-center gap-1.5 justify-center">
              {/* Row number */}
              <div className="w-8 text-right text-xs font-semibold text-[#9ca3af] pr-2 shrink-0">
                {rowNum}
              </div>

              {layout.columns.map((col, colIdx) => {
                const seatNumber = `${rowNum}${col}`;
                const info = seatsInfo[seatNumber] || { status: 'available', isExitRow: false, priceModifier: 0 };
                const isSelectedByMe = currentLegSeats.includes(seatNumber);
                const isSelectedByOther = allSelectedSeats.includes(seatNumber) && !isSelectedByMe;
                const isOccupied = info.status !== "available" || isSelectedByOther;
                
                // We use isFrontRow only for styling (like label Tooltip in SeatCell)
                // The actual price is driven by info.priceModifier
                const isFrontRow = info.priceModifier > 0 && !info.isExitRow;

                return (
                  <React.Fragment key={seatNumber}>
                    <SeatCell
                      seatNumber={seatNumber}
                      columnLetter={col}
                      isOccupied={isOccupied}
                      isSelected={isSelectedByMe}
                      isExitRow={info.isExitRow}
                      isFrontRow={isFrontRow}
                      price={info.priceModifier || 0}
                      onClick={() => onSeatClick(seatNumber)}
                      disabled={!isSelectedByMe && maxSeatsReached}
                    />
                    
                    {aisleIndices.has(colIdx) && (
                      <div className="w-6 md:w-8 flex items-center justify-center relative">
                        {/* Show Exit label only in the very first aisle to avoid clutter */}
                        {isExitRow && colIdx === Array.from(aisleIndices)[0] && (
                          <div className="absolute flex flex-col items-center justify-center text-[8px] md:text-[10px] text-red-500 font-bold uppercase w-16">
                            <span>Exit</span>
                            <span>→</span>
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-8 justify-center flex-wrap text-xs text-[#6b7280]">
        {[
          { color: "#ffffff", border: "#e5e7eb", label: t.booking.seat.legend.available },
          { color: "#f3f4f6", border: "#d1d5db", label: "Front Row" },
          { color: "#fdf8e6", border: "#f5c800", label: "Exit Row" },
          { color: "#f5c800", border: "#c9a200", label: t.booking.seat.legend.selected },
          { color: "#e5e7eb", border: "#d1d5db", label: t.booking.seat.legend.occupied },
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
    </div>
  );
}
