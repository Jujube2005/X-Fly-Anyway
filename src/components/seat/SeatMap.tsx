"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { SeatLayout } from "@/types/seat";
import { SeatCell } from "./SeatCell";

export function getSeatPrice(isExitRow: boolean, isFrontRow: boolean): number {
  if (isExitRow) return 700;
  if (isFrontRow) return 300;
  return 0;
}

export function aisleAfterIndex(columns: string[]): number {
  const len = columns.length;
  if (len === 6) return 2;
  if (len === 4) return 1;
  return Math.floor(len / 2) - 1;
}

interface SeatMapProps {
  layout: SeatLayout;
  seatsInfo: Record<string, { status: string; isExitRow: boolean; isWindow: boolean; isAisle: boolean }>;
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

  const aisleIdx = aisleAfterIndex(layout.columns);
  const leftCols  = layout.columns.slice(0, aisleIdx + 1);
  const rightCols = layout.columns.slice(aisleIdx + 1);

  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="flex items-center gap-1.5 mb-4 justify-center">
        <div className="w-8 shrink-0" /> {/* row-number gutter */}
        {leftCols.map((col) => (
          <div key={`h-${col}`} className="w-10 md:w-11 text-center text-xs font-bold text-[#6b7280]">
            {col}
          </div>
        ))}
        <div className="w-6 md:w-8" /> {/* aisle gap */}
        {rightCols.map((col) => (
          <div key={`h-${col}`} className="w-10 md:w-11 text-center text-xs font-bold text-[#6b7280]">
            {col}
          </div>
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

              {/* Left columns */}
              {leftCols.map((col) => {
                const seatNumber = `${rowNum}${col}`;
                const info = seatsInfo[seatNumber] || { status: 'available', isExitRow: false, isFrontRow: false };
                const isSelectedByMe = currentLegSeats.includes(seatNumber);
                const isSelectedByOther = allSelectedSeats.includes(seatNumber) && !isSelectedByMe;
                const isOccupied = info.status !== "available" || isSelectedByOther;
                const isFrontRow = rowNum === layout.firstRow;

                return (
                  <SeatCell
                    key={seatNumber}
                    seatNumber={seatNumber}
                    columnLetter={col}
                    isOccupied={isOccupied}
                    isSelected={isSelectedByMe}
                    isExitRow={info.isExitRow}
                    isFrontRow={isFrontRow}
                    price={getSeatPrice(info.isExitRow, isFrontRow)}
                    onClick={() => onSeatClick(seatNumber)}
                    disabled={!isSelectedByMe && maxSeatsReached}
                  />
                );
              })}

              {/* Aisle gap */}
              <div className="w-6 md:w-8 flex items-center justify-center relative">
                {isExitRow && (
                  <div className="absolute flex flex-col items-center justify-center text-[8px] md:text-[10px] text-red-500 font-bold uppercase w-16">
                    <span>Exit</span>
                    <span>→</span>
                  </div>
                )}
              </div>

              {/* Right columns */}
              {rightCols.map((col) => {
                const seatNumber = `${rowNum}${col}`;
                const info = seatsInfo[seatNumber] || { status: 'available', isExitRow: false, isFrontRow: false };
                const isSelectedByMe = currentLegSeats.includes(seatNumber);
                const isSelectedByOther = allSelectedSeats.includes(seatNumber) && !isSelectedByMe;
                const isOccupied = info.status !== "available" || isSelectedByOther;
                const isFrontRow = rowNum === layout.firstRow;

                return (
                  <SeatCell
                    key={seatNumber}
                    seatNumber={seatNumber}
                    columnLetter={col}
                    isOccupied={isOccupied}
                    isSelected={isSelectedByMe}
                    isExitRow={info.isExitRow}
                    isFrontRow={isFrontRow}
                    price={getSeatPrice(info.isExitRow, isFrontRow)}
                    onClick={() => onSeatClick(seatNumber)}
                    disabled={!isSelectedByMe && maxSeatsReached}
                  />
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
