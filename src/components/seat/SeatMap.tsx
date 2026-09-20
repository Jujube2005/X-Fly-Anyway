"use client";

import React, { useMemo } from "react";
import { SeatLayout, SeatInfo } from "@/types/seat";
import { SeatCell } from "./SeatCell";

interface SeatMapProps {
  layout: SeatLayout;
  seatsInfo: Record<string, SeatInfo>;
  currentLegSeats: string[];
  allSelectedSeats: string[];
  onSeatClick: (seatNumber: string) => void;
  maxSeatsReached: boolean;
  currency: string;
}

export function SeatMap({
  layout,
  seatsInfo,
  currentLegSeats,
  allSelectedSeats,
  onSeatClick,
  maxSeatsReached,
  currency,
}: SeatMapProps) {
  const rowNumbers = useMemo(() => {
    const list: number[] = [];
    for (let r = layout.firstRow; r <= layout.lastRow; r++) {
      list.push(r);
    }
    return list;
  }, [layout.firstRow, layout.lastRow]);

  // Determine aisle positions dynamically based on seat definitions
  const aisleAfterColIndices = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < layout.columns.length - 1; i++) {
      const colA = layout.columns[i];
      const colB = layout.columns[i + 1];
      let hasAisleBetween = false;
      for (const rowNum of rowNumbers) {
        const seatA = seatsInfo[`${rowNum}${colA}`];
        const seatB = seatsInfo[`${rowNum}${colB}`];
        if (seatA?.isAisle && seatB?.isAisle) {
          hasAisleBetween = true;
          break;
        }
      }
      if (hasAisleBetween) {
        set.add(i);
      }
    }
    // Fallback: if no adjacent pair found, place aisle in the middle (e.g. 3-3 -> after col index 2)
    if (set.size === 0 && layout.columns.length > 2) {
      set.add(Math.floor(layout.columns.length / 2) - 1);
    }
    return set;
  }, [layout.columns, rowNumbers, seatsInfo]);

  // Identify exit rows across the cabin
  const exitRows = useMemo(() => {
    const set = new Set<number>();
    rowNumbers.forEach((rowNum) => {
      if (layout.columns.some((col) => seatsInfo[`${rowNum}${col}`]?.isExitRow)) {
        set.add(rowNum);
      }
    });
    return set;
  }, [rowNumbers, layout.columns, seatsInfo]);

  return (
    <div className="flex flex-col items-start select-none relative my-auto py-2">
      {/* Top Header: Row Numbers (X-axis: 1 .. N progressing Left to Right) */}
      <div className="flex flex-row items-end mb-2.5">
        {/* Top-left spacer for Y-axis seat letter labels */}
        <div className="w-7 sm:w-8 shrink-0" />

        {rowNumbers.map((rowNum) => {
          const isExit = exitRows.has(rowNum);
          return (
            <div
              key={`row-header-${rowNum}`}
              className="w-10 sm:w-11 flex flex-col items-center justify-end shrink-0"
            >
              {isExit && (
                <span className="text-[8px] font-extrabold text-amber-600 uppercase tracking-tighter mb-0.5">
                  EXIT
                </span>
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                {rowNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Seat Rows (Y-axis: A, B, C ... D, E, F progressing Top to Bottom) */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {layout.columns.map((col, colIdx) => {
          return (
            <React.Fragment key={`col-group-${col}`}>
              {/* Horizontal line of seats for this column letter across all rows */}
              <div className="flex flex-row items-center">
                {/* Left Header: Column Letter (Y-axis) */}
                <div className="w-7 sm:w-8 text-right pr-2 text-xs sm:text-sm font-black text-slate-400 shrink-0">
                  {col}
                </div>

                {/* Individual Seat Cells across rows 1 .. N */}
                {rowNumbers.map((rowNum) => {
                  const seatNumber = `${rowNum}${col}`;
                  const info = seatsInfo[seatNumber];
                  if (!info) {
                    return (
                      <div
                        key={`empty-${seatNumber}`}
                        className="w-10 sm:w-11 h-9 sm:h-10 flex items-center justify-center shrink-0"
                      />
                    );
                  }

                  const isSelectedByMe = currentLegSeats.includes(seatNumber);
                  const isSelectedByOther =
                    allSelectedSeats.includes(seatNumber) && !isSelectedByMe;
                  const isOccupied =
                    info.status !== "available" || isSelectedByOther;
                  const isFrontRow =
                    info.priceModifier > 0 && !info.isExitRow;

                  return (
                    <div
                      key={seatNumber}
                      className="w-10 sm:w-11 flex justify-center shrink-0"
                    >
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
                        currency={currency}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Aisle Row: Clean horizontal gap between seat groups */}
              {aisleAfterColIndices.has(colIdx) && (
                <div className="flex flex-row items-center h-7 sm:h-8 my-1">
                  {/* Left spacer matching letter column */}
                  <div className="w-7 sm:w-8 shrink-0" />

                  {/* Aisle space for each row */}
                  {rowNumbers.map((rowNum) => {
                    const isExit = exitRows.has(rowNum);
                    return (
                      <div
                        key={`aisle-${rowNum}`}
                        className="w-10 sm:w-11 flex items-center justify-center shrink-0 relative"
                      >
                        {isExit ? (
                          <div className="bg-amber-50 text-amber-700 border border-amber-300 px-1 py-0.5 rounded text-[8px] font-black tracking-tight whitespace-nowrap shadow-2xs z-10">
                            « EXIT »
                          </div>
                        ) : (
                          <div className="w-full h-[1px] bg-slate-200/50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
