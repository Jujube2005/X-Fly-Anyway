"use client";
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SeatLayout, SeatInfo } from "@/types/seat";
import { SeatCell } from "./SeatCell";

interface SeatMapProps {
  layout: SeatLayout;
  seatsInfo: Record<string, SeatInfo>;
  currentLegSeats: string[];
  allSelectedSeats: string[]; 
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

  const exitRows = new Set<number>();
  rowNumbers.forEach(rowNum => {
    const isExitRow = layout.columns.some(col => seatsInfo[`${rowNum}${col}`]?.isExitRow);
    if (isExitRow) exitRows.add(rowNum);
  });

  return (
    <div className="flex flex-col items-start w-full select-none">
      <div className="flex flex-row items-center gap-2 sm:gap-3">
        {/* Column Headers (now on the left edge as row labels) */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mr-4 shrink-0">
          <div className="h-6 sm:h-8" /> {/* Spacer for row number header */}
          {layout.columns.map((col, colIdx) => (
            <React.Fragment key={`h-${col}`}>
              <div className="h-11 sm:h-12 w-6 flex items-center justify-center text-xs sm:text-sm font-bold text-[#6b7280]">
                {col}
              </div>
              {aisleIndices.has(colIdx) && <div className="h-8 sm:h-12" />}
            </React.Fragment>
          ))}
        </div>

        {/* The Cabin Sections (flowing left to right) */}
        {rowNumbers.map((rowNum) => {
          const isExit = exitRows.has(rowNum);
          const isFirstRow = rowNum === rowNumbers[0];

          return (
            <React.Fragment key={rowNum}>
              {/* Meaningful Visual Separation for Exit Rows (Vertical divider) */}
              {isExit && !isFirstRow && (
                <div className="h-full flex flex-col items-center justify-center px-4 md:px-8 mx-2">
                  <div className="w-px bg-red-200 h-full min-h-[300px] relative flex flex-col items-center justify-between">
                    <div className="absolute top-[-20px] bg-[#f9fafb] py-2 text-red-500 font-bold text-xs uppercase flex flex-col items-center gap-1">
                      <span>↑</span> EXIT
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 bg-[#f9fafb] py-4 text-red-400 font-semibold text-xs tracking-widest border border-red-100 rounded-full px-1" style={{ writingMode: 'vertical-rl' }}>
                      EXIT PATH
                    </div>
                    <div className="absolute bottom-[-20px] bg-[#f9fafb] py-2 text-red-500 font-bold text-xs uppercase flex flex-col items-center gap-1">
                      EXIT <span>↓</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative flex flex-col items-center gap-1.5 sm:gap-2 justify-center group shrink-0">
                {/* Row number (Top) */}
                <div className="h-6 sm:h-8 text-center text-xs sm:text-sm font-semibold text-[#9ca3af] mb-2">
                  {rowNum}
                </div>

                {layout.columns.map((col, colIdx) => {
                  const seatNumber = `${rowNum}${col}`;
                  const info = seatsInfo[seatNumber] || { status: 'available', isExitRow: false, priceModifier: 0 };
                  const isSelectedByMe = currentLegSeats.includes(seatNumber);
                  const isSelectedByOther = allSelectedSeats.includes(seatNumber) && !isSelectedByMe;
                  const isOccupied = info.status !== "available" || isSelectedByOther;
                  const isFrontRow = info.priceModifier > 0 && !info.isExitRow;

                  return (
                    <React.Fragment key={seatNumber}>
                      <div className="my-1">
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
                      </div>
                      
                      {/* Aisle Spacer (Vertical) */}
                      {aisleIndices.has(colIdx) && (
                        <div className="h-8 sm:h-12 w-full flex items-center justify-center shrink-0">
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-12 justify-center text-xs sm:text-sm text-[#6b7280] bg-white border border-gray-200 px-6 py-4 rounded-2xl shadow-sm w-full sticky left-0">
        {[
          { color: "#ffffff", border: "#e5e7eb", label: t.booking.seat.legend.available },
          { color: "#f3f4f6", border: "#d1d5db", label: "Front Row" },
          { color: "#fdf8e6", border: "#f5c800", label: "Exit Row" },
          { color: "#f5c800", border: "#c9a200", label: t.booking.seat.legend.selected },
          { color: "#e5e7eb", border: "#d1d5db", label: t.booking.seat.legend.occupied },
        ].map(({ color, border, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md"
              style={{ background: color, border: `2px solid ${border}` }}
            />
            <span className="font-medium text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
