"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { CabinClass } from "@/types/flight";
import { getSeatPrice } from "./SeatMap";

interface SeatSelectionSummaryProps {
  passengerCount: number;
  selectedSeats: string[]; // mapped to passenger indices
  seatsInfo: Record<string, { status: string; isExitRow: boolean; isWindow: boolean; isAisle: boolean }>;
  firstRow: number;
  cabinClass: CabinClass;
  onConfirm: () => void;
  onClear: () => void;
  isNextFlight: boolean;
}

export function SeatSelectionSummary({
  passengerCount,
  selectedSeats,
  seatsInfo,
  firstRow,
  cabinClass,
  onConfirm,
  onClear,
  isNextFlight,
}: SeatSelectionSummaryProps) {
  const { t } = useTranslation();

  const assignedCount = selectedSeats.filter(Boolean).length;
  const isComplete = assignedCount === passengerCount;

  let totalPrice = 0;
  const seatDetails = selectedSeats.map((seatNumber, index) => {
    if (!seatNumber) return null;
    const info = seatsInfo[seatNumber] || { isExitRow: false };
    const isFrontRow = parseInt(seatNumber) === firstRow; // approximate
    const price = getSeatPrice(info.isExitRow, isFrontRow);
    totalPrice += price;
    
    let typeLabel = "Standard";
    if (info.isExitRow) typeLabel = "Exit Row";
    else if (isFrontRow) typeLabel = "Front Row";

    return { seatNumber, index, price, typeLabel };
  });

  return (
    <div className="w-full lg:w-80 shrink-0 rounded-[32px] p-6 bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl sticky top-24 seat-selection-panel">
      <h2 className="text-xl font-bold text-[#111827] mb-6">
        {t.booking.seat.yourSelection}
      </h2>

      {assignedCount === 0 ? (
        <div className="text-sm text-[#6b7280] mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <p>Please select {passengerCount} seat{passengerCount > 1 ? "s" : ""} from the map.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {seatDetails.map((detail, i) => {
            if (!detail) return (
               <div key={`p-${i}`} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 opacity-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500">Passenger {i + 1}</span>
                    <span className="text-sm text-gray-400">No seat assigned</span>
                  </div>
               </div>
            );

            return (
              <div key={detail.seatNumber} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#6b7280]">Passenger {detail.index + 1}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-lg text-[#111827]">{detail.seatNumber}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {detail.typeLabel}
                    </span>
                  </div>
                  <span className="text-xs text-[#9ca3af] capitalize mt-0.5">{cabinClass}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-[#111827]">
                    {detail.price > 0 ? `+฿${detail.price.toLocaleString()}` : "Included"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-[#e5e7eb] pt-4 mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-[#6b7280]">Seat Selection Total</span>
          <span className="text-2xl font-bold text-[#111827]">
            ฿{totalPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs font-medium mt-3">
          <span className="text-[#6b7280]">{t.booking.seat.selected}</span>
          <span className={`px-2 py-1 rounded-md ${isComplete ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {assignedCount} / {passengerCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          disabled={!isComplete}
          className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-shadow"
        >
          {isNextFlight ? "Next Flight →" : t.booking.seat.confirmSeats}
        </Button>
        <Button
          variant="ghost"
          onClick={onClear}
          disabled={assignedCount === 0}
          className="w-full text-[#6b7280] text-sm hover:bg-gray-100/50"
        >
          {t.booking.seat.changeSelection}
        </Button>
      </div>
    </div>
  );
}
