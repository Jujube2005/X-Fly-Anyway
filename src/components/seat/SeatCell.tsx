"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface SeatCellProps {
  seatNumber: string;
  columnLetter: string;
  isOccupied: boolean;
  isSelected: boolean;
  isExitRow: boolean;
  isFrontRow: boolean;
  price: number;
  onClick: () => void;
  disabled: boolean;
}

export function SeatCell({
  seatNumber,
  columnLetter,
  isOccupied,
  isSelected,
  isExitRow,
  isFrontRow,
  price,
  onClick,
  disabled,
}: SeatCellProps) {
  const { t } = useTranslation();

  const getSeatConfig = () => {
    if (isOccupied) {
      return {
        base: "bg-[#27272a] border-[#3f3f46] text-zinc-400 cursor-not-allowed opacity-90",
        seatBack: "bg-[#3f3f46] border-l border-zinc-700",
        label: t.booking.seat.status.occupied,
      };
    }
    if (isSelected) {
      return {
        base: "bg-[#f5c800] border-[#d9af00] text-slate-950 font-bold shadow-md ring-2 ring-[#f5c800]/50 scale-105 z-10",
        seatBack: "bg-[#d9af00] border-l border-[#b59200]",
        label: t.booking.seat.status.selected,
      };
    }
    if (isExitRow) {
      return {
        base: "bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 hover:border-sky-400 shadow-sm cursor-pointer",
        seatBack: "bg-sky-200 border-l border-sky-300",
        label: "Exit Row",
      };
    }
    if (isFrontRow || price > 0) {
      return {
        base: "bg-amber-50/90 border-amber-300 text-amber-950 hover:bg-amber-100 hover:border-amber-400 shadow-sm cursor-pointer",
        seatBack: "bg-amber-300 border-l border-amber-400",
        label: "Premium",
      };
    }

    return {
      base: "bg-white border-slate-300 text-slate-700 hover:bg-amber-50/40 hover:border-amber-400 shadow-sm cursor-pointer",
      seatBack: "bg-slate-200 border-l border-slate-300",
      label: t.booking.seat.status.available,
    };
  };

  const config = getSeatConfig();
  const priceDisplay = price > 0 ? `+฿${price.toLocaleString()}` : "Included";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOccupied || disabled}
      title={`${seatNumber} - ${config.label} (${priceDisplay})`}
      aria-label={`${seatNumber} - ${config.label}`}
      className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border rounded-l-lg rounded-r-md transition-all duration-150 shrink-0 select-none overflow-hidden group ${config.base}`}
    >
      {/* Armrests simulation (top and bottom subtle horizontal inset lines) */}
      <div className="absolute top-0 inset-x-1 h-[2px] bg-black/5 rounded-t-sm" />
      <div className="absolute bottom-0 inset-x-1 h-[2px] bg-black/5 rounded-b-sm" />

      {/* Premium indicator dot */}
      {(isFrontRow || (price > 0 && !isExitRow)) && !isOccupied && !isSelected && (
        <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
      )}

      {/* Exit row indicator dot */}
      {isExitRow && !isOccupied && !isSelected && (
        <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-sky-600" />
      )}

      {/* Seat Cushion & Column Letter / Checkmark (Upright, facing Nose to the left) */}
      {isSelected ? (
        <span className="text-xs font-black z-10 pr-2 text-slate-950 flex items-center justify-center">
          ✓
        </span>
      ) : (
        <span className={`text-[11px] sm:text-xs font-bold z-10 pr-2 ${isOccupied ? "text-zinc-400" : ""}`}>
          {columnLetter}
        </span>
      )}

      {/* Occupied X indicator */}
      {isOccupied && (
        <svg
          className="absolute inset-0 m-auto w-3.5 h-3.5 text-zinc-500 opacity-60 z-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}

      {/* Realistic Headrest / Seat Backrest (Attached to right edge, towards tail) */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-2 sm:w-2.5 ${config.seatBack} rounded-r-md shadow-inner`}
      />
    </button>
  );
}
