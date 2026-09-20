"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { CabinClass } from "@/types/flight";
import { SeatInfo } from "@/types/seat";
import { useTranslation } from "@/hooks/useTranslation";

interface SeatSelectionSummaryProps {
  passengerCount: number;
  selectedSeats: string[]; // mapped to passenger indices
  seatsInfo: Record<string, SeatInfo>;
  firstRow: number;
  cabinClass: CabinClass;
  onConfirm: () => void;
  onClear: () => void;
  isNextFlight: boolean;
  currency: string;
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
  currency,
}: SeatSelectionSummaryProps) {
  const { t } = useTranslation();
  
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  
  const assignedCount = selectedSeats.filter(Boolean).length;
  const isComplete = assignedCount === passengerCount;

  // Format cabin class for display
  const formatCabinName = (info?: SeatInfo) => {
    if (info?.isExitRow) return "Exit Row";
    if (info && (info.priceModifier > 0 || info.rowNumber === firstRow)) {
      return cabinClass === "economy" ? "Economy Plus" : "Premium";
    }
    return cabinClass.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const seatDetails = selectedSeats.map((seatNumber, index) => {
    if (!seatNumber) return null;
    const info = seatsInfo[seatNumber];
    if (!info) return null;

    const price = info.priceModifier || 0;
    const cabinName = formatCabinName(info);
    const position = info.isWindow
      ? "Window"
      : info.isAisle
      ? "Aisle"
      : "Middle";

    return { seatNumber, index, price, cabinName, position };
  });

  const totalPrice = seatDetails.reduce(
    (sum, detail) => sum + (detail?.price || 0),
    0
  );

  return (
    <div className="w-full glass-card border-[#f5c800]/50 p-5 sm:p-6 flex flex-col justify-between">
      {/* Top Header matching reference pill design */}
      <div>
        <div className="glass-panel rounded-xl py-2.5 px-4 text-center font-bold text-[#111827] text-lg mb-5 shadow-2xs">
          {t.booking?.seat?.yourSelection ?? "Your Selection"}
        </div>

        {/* Selected List */}
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 drop-shadow-sm">
          {t.booking?.seat?.selected ?? "Selected"}:
        </h3>

        {assignedCount === 0 ? (
          <div className="text-sm text-slate-700 py-8 px-4 glass-panel border border-dashed flex flex-col items-center justify-center text-center">
            <p className="font-medium text-[#111827]">{t.booking?.seat?.noSeats ?? "No seats selected"}</p>
            <p className="text-xs text-slate-700 mt-1">
              {t.booking?.seat?.selectUpTo ?? "Select up to"} {passengerCount} {(t.booking?.seat?.seat ?? "seat").toLowerCase()}{passengerCount > 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-400/30 mb-6">
            {seatDetails.map((detail, i) => {
              if (!detail) {
                return (
                  <div
                    key={`unassigned-${i}`}
                    className="py-3 flex items-center justify-between text-slate-700 opacity-80 text-xs"
                  >
                    <span>{t.booking?.passenger?.passengerN ?? "Passenger"} {i + 1}</span>
                    <span className="italic">{t.booking?.seat?.noSeats ?? "No seat assigned"}</span>
                  </div>
                );
              }

              return (
                <div
                  key={detail.seatNumber}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-1.5 font-medium text-[#111827]">
                    <span className="font-bold">{t.booking?.seat?.seat ?? "Seat"} {detail.seatNumber}</span>
                    <span className="text-xs text-slate-700">
                      ({detail.cabinName}, {detail.position})
                    </span>
                  </div>

                  <div className="text-right font-bold text-[#111827]">
                    {detail.price > 0 ? `+${formatPrice(detail.price)}` : t.booking?.summary?.included ?? "Included"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Summary & Actions */}
      <div className="pt-4 border-t border-slate-400/30 mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-800">
            {t.booking?.summary?.total ?? "Total"}:
          </span>
          <span className="text-xl font-black text-[#111827]">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-5">
          <span>{t.booking?.seat?.seatsCurrent ?? "Seats Assigned"}</span>
          <span
            className={
              isComplete ? "text-emerald-800 font-bold drop-shadow-sm" : "text-slate-700"
            }
          >
            {assignedCount} / {passengerCount}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="outline"
            onClick={onClear}
            disabled={assignedCount === 0}
            className="glass-button w-full h-11 rounded-xl text-sm font-semibold text-[#111827]"
          >
            {t.booking?.seat?.changeSelection ?? "Change Selection"}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!isComplete}
            className="w-full h-11 rounded-xl text-sm font-bold bg-[#f5c800] text-slate-950 hover:bg-[#e6bb00] shadow-md transition-all disabled:opacity-50"
          >
            {isNextFlight ? "Next Flight" : (t.booking?.seat?.confirmSeats ?? "Confirm Seats")}
          </Button>
        </div>
      </div>
    </div>
  );
}
