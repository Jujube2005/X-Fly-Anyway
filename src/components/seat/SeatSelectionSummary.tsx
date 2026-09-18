"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { CabinClass } from "@/types/flight";
import { SeatInfo } from "@/types/seat";

interface SeatSelectionSummaryProps {
  passengerCount: number;
  selectedSeats: string[]; // mapped to passenger indices
  seatsInfo: Record<string, SeatInfo>;
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

  // Format cabin class for display (e.g., "premium_economy" -> "Premium Economy")
  const displayCabinClass = cabinClass.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

  const seatDetails = selectedSeats.map((seatNumber, index) => {
    if (!seatNumber) return null;
    const info = seatsInfo[seatNumber];
    if (!info) return null;
    
    const price = info.priceModifier || 0;
    
    let typeLabel = "Standard";
    if (info.isExitRow) typeLabel = "Exit Row";
    else if (info.priceModifier > 0) typeLabel = "Front Row";
    
    const position = info.isWindow ? "Window" : (info.isAisle ? "Aisle" : "Middle");

    return { seatNumber, index, price, typeLabel, position };
  });

  const totalPrice = seatDetails.reduce((sum, detail) => sum + (detail?.price || 0), 0);

  return (
    <div className="w-full lg:w-80 shrink-0 bg-white border border-[#e5e7eb] rounded-[24px] shadow-lg sticky top-24 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#f9fafb] px-6 py-5 border-b border-[#e5e7eb]">
        <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#f5c800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Your Selection
        </h2>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {assignedCount === 0 ? (
          <div className="text-sm text-[#6b7280] mb-8 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-center h-32">
            Please select {passengerCount} seat{passengerCount > 1 ? "s" : ""} from the aircraft map to proceed.
          </div>
        ) : (
          <div className="flex flex-col gap-0 mb-6">
            <h3 className="text-sm font-semibold text-[#374151] mb-3 uppercase tracking-wider">
              Selected:
            </h3>
            {seatDetails.map((detail, i) => {
              if (!detail) return (
                 <div key={`p-${i}`} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 opacity-50">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#111827]">Passenger {i + 1}</span>
                      <span className="text-sm text-gray-500">No seat assigned</span>
                    </div>
                 </div>
              );

              return (
                <div key={detail.seatNumber} className="flex justify-between items-start py-4 border-b border-gray-100 last:border-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#111827] text-lg">Seat {detail.seatNumber}</span>
                    <span className="text-sm text-[#6b7280]">
                      {displayCabinClass} &middot; {detail.typeLabel}
                    </span>
                    <span className="text-sm text-[#9ca3af]">
                      {detail.position}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-semibold text-[#111827]">
                      {detail.price > 0 ? `$${detail.price.toLocaleString()}` : "Included"}
                    </span>
                    <svg className="w-4 h-4 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto">
          {/* Total Block */}
          <div className="bg-[#f9fafb] p-4 rounded-xl border border-[#e5e7eb] mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#374151]">Total Seat Selection:</span>
              <span className="text-xl font-bold text-[#111827]">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium mt-2 text-[#6b7280]">
              <span>Seats Assigned</span>
              <span className={isComplete ? "text-green-600 font-bold" : "text-gray-500"}>
                {assignedCount} / {passengerCount}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={onClear}
              disabled={assignedCount === 0}
              className="w-full text-[#374151] border-[#d1d5db] hover:bg-gray-50 h-12 rounded-xl font-semibold"
            >
              Change Selection
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!isComplete}
              className="w-full h-12 rounded-xl text-base font-bold bg-[#f5c800] text-[#111827] hover:bg-[#e6bb00] shadow-md transition-colors"
            >
              {isNextFlight ? "Next Flight" : "Confirm Seats"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
