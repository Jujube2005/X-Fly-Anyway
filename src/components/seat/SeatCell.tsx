"use client";

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

  const getSeatStyle = () => {
    if (isOccupied) {
      return { 
        base: "bg-[#e5e7eb] border-[#d1d5db] text-[#9ca3af] cursor-not-allowed opacity-80", 
        seatBack: "bg-[#d1d5db]",
        label: t.booking.seat.status.occupied 
      };
    }
    if (isSelected) {
      return { 
        base: "bg-[#f5c800] border-[#c9a200] text-[#111827] cursor-pointer shadow-md transform scale-105 transition-transform", 
        seatBack: "bg-[#d9b100]",
        label: t.booking.seat.status.selected 
      };
    }
    if (isExitRow) {
      return { 
        base: "bg-[#fdf8e6] border-[#f5c800] text-[#856600] hover:bg-[#faebb3] cursor-pointer shadow-sm transition-colors", 
        seatBack: "bg-[#faebb3]",
        label: "Exit Row" 
      };
    }
    if (isFrontRow) {
      return { 
        base: "bg-[#f3f4f6] border-[#d1d5db] text-[#374151] hover:bg-[#e5e7eb] cursor-pointer shadow-sm transition-colors", 
        seatBack: "bg-[#e5e7eb]",
        label: "Front Row" 
      };
    }
    
    return { 
      base: "bg-white border-[#d1d5db] text-[#374151] hover:bg-gray-50 hover:border-gray-400 cursor-pointer shadow-sm transition-colors", 
      seatBack: "bg-gray-200",
      label: t.booking.seat.status.available 
    };
  };

  const style = getSeatStyle();
  const priceDisplay = price > 0 ? `+฿${price.toLocaleString()}` : "Included";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOccupied || disabled}
      title={`${style.label} ${priceDisplay !== 'Included' ? priceDisplay : ''}`}
      aria-label={`${seatNumber} - ${style.label}`}
      className={`relative flex items-center justify-center w-11 h-9 sm:w-12 sm:h-11 border rounded-l-lg rounded-r-md ${style.base} focus:outline-none focus:ring-2 focus:ring-[#f5c800] focus:ring-offset-1 shrink-0 overflow-hidden group`}
    >
      {/* Seat Armrests/Cushion detailing (Top and Bottom now, since it faces left) */}
      <div className="absolute inset-y-0.5 left-0.5 right-2 border border-black/5 rounded-l-md rounded-r-sm bg-gradient-to-r from-white/20 to-transparent z-0"></div>
      
      {/* Seat Label (Upright) */}
      <span className="text-[10px] sm:text-xs font-semibold z-10 -ml-1">
        {columnLetter}
      </span>
      
      {/* Occupied X indicator */}
      {isOccupied && (
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 opacity-60 z-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      
      {/* Seat back structure (On the RIGHT side, since nose is LEFT) */}
      <div className={`absolute right-0 top-0 bottom-0 w-2.5 sm:w-3 ${style.seatBack} rounded-r-sm shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)] border-l border-black/5 z-0`} />
    </button>
  );
}
