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

  // Which columns have aisles AFTER them
  const aisleIndices = new Set<number>();
  for (let i = 0; i < layout.columns.length - 1; i++) {
    const colA = layout.columns[i];
    const colB = layout.columns[i + 1];
    for (const rowNum of rowNumbers) {
      if (seatsInfo[`${rowNum}${colA}`]?.isAisle && seatsInfo[`${rowNum}${colB}`]?.isAisle) {
        aisleIndices.add(i);
        break;
      }
    }
  }

  const exitRows = new Set<number>();
  rowNumbers.forEach(rowNum => {
    if (layout.columns.some(col => seatsInfo[`${rowNum}${col}`]?.isExitRow)) {
      exitRows.add(rowNum);
    }
  });

  return (
    <div className="flex flex-col items-start select-none relative">
      
      {/* Top Header: Row Numbers (X-axis) */}
      <div className="flex flex-row items-center mb-4">
        {/* Top-left corner spacer for the A,B,C labels */}
        <div className="w-8 sm:w-10 shrink-0" />
        
        {rowNumbers.map((rowNum) => (
          <div key={`h-row-${rowNum}`} className="w-12 sm:w-14 text-center text-xs sm:text-sm font-semibold text-[#9ca3af] shrink-0">
            {rowNum}
          </div>
        ))}
      </div>

      {/* The Rows of Seats (Outer loop: Columns A, B, C; Inner loop: Row Nums 1, 2, 3) */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {layout.columns.map((col, colIdx) => {
          
          return (
            <React.Fragment key={col}>
              {/* Horizontal line of seats for this column (e.g. all 'A' seats going from nose to tail) */}
              <div className="flex flex-row items-center">
                
                {/* Left Header: Column Letter (Y-axis) */}
                <div className="w-8 sm:w-10 text-right pr-3 text-xs sm:text-sm font-bold text-[#6b7280] shrink-0">
                  {col}
                </div>

                {/* The Seats for this specific column letter across all rows */}
                {rowNumbers.map((rowNum) => {
                  const seatNumber = `${rowNum}${col}`;
                  const info = seatsInfo[seatNumber] || { status: 'available', isExitRow: false, priceModifier: 0 };
                  const isSelectedByMe = currentLegSeats.includes(seatNumber);
                  const isSelectedByOther = allSelectedSeats.includes(seatNumber) && !isSelectedByMe;
                  const isOccupied = info.status !== "available" || isSelectedByOther;
                  const isFrontRow = info.priceModifier > 0 && !info.isExitRow;

                  return (
                    <div key={seatNumber} className="w-12 sm:w-14 flex justify-center shrink-0">
                      {info.status === 'available' || isOccupied ? (
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
                      ) : (
                        <div className="w-11 h-9 sm:w-12 sm:h-11" /> /* Empty spacer for non-existent seat */
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Aisle (Horizontal Gap across the length of the plane) */}
              {aisleIndices.has(colIdx) && (
                <div className="flex flex-row items-center h-8 sm:h-10 my-1">
                  <div className="w-8 sm:w-10 shrink-0" />
                  
                  {/* Inside the Aisle, print "EXIT" indicator for exit rows */}
                  {rowNumbers.map(rowNum => (
                    <div key={`aisle-${rowNum}`} className="w-12 sm:w-14 flex items-center justify-center shrink-0 text-red-400 font-bold text-[10px] sm:text-xs">
                      {exitRows.has(rowNum) ? (
                         <div className="bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10 relative">
                           EXIT
                         </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}
