"use client";

import { useTranslation } from "@/hooks/useTranslation";

export interface SeatCellProps {
  seatNumber: string;
  columnLetter: string;
  isOccupied: boolean;
  isSelected: boolean;
  isExitRow: boolean;
  isFrontRow: boolean;
  price: number;
  onClick: () => void;
  disabled?: boolean;
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

  const getStyle = () => {
    if (isOccupied) return { bg: "#e5e7eb", border: "#d1d5db", text: "#9ca3af", cursor: "cursor-not-allowed", label: t.booking.seat.status.occupied };
    if (isSelected) return { bg: "#f5c800", border: "#c9a200", text: "#111827", cursor: "cursor-pointer", label: t.booking.seat.status.selected };
    if (isExitRow)  return { bg: "#fdf8e6", border: "#f5c800", text: "#b48c00", cursor: "cursor-pointer", label: "Exit Row" };
    if (isFrontRow) return { bg: "#f3f4f6", border: "#d1d5db", text: "#374151", cursor: "cursor-pointer", label: "Front Row" };
    return { bg: "#ffffff", border: "#e5e7eb", text: "#374151", cursor: "cursor-pointer", label: t.booking.seat.status.available };
  };

  const { bg, border, text, cursor, label } = getStyle();

  return (
    <div className="relative group inline-block">
      <button
        onClick={isOccupied || disabled ? undefined : onClick}
        disabled={isOccupied || disabled}
        aria-label={`Seat ${seatNumber} ${label}`}
        className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-t-xl rounded-b-md text-xs font-semibold transition-all duration-200 ${cursor} ${
          isOccupied ? "opacity-60" : "hover:opacity-90 hover:-translate-y-1 hover:shadow-md"
        } ${isSelected ? "shadow-md scale-105" : ""}`}
        style={{
          background: bg,
          border: `1.5px solid ${border}`,
          color: text,
          borderBottomWidth: "4px", // to simulate seat cushion
        }}
      >
        {isOccupied ? "×" : columnLetter}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        <div className="font-bold text-sm mb-1">{seatNumber}</div>
        <div className="text-gray-300">{label}</div>
        {!isOccupied && <div className="text-[#f5c800] font-semibold mt-1">฿{price.toLocaleString()}</div>}
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90" />
      </div>
    </div>
  );
}
