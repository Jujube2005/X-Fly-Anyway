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
    <div className="w-full bg-white/90 backdrop-blur-md border-2 border-[#f5c800] rounded-3xl shadow-xl p-5 sm:p-6 flex flex-col justify-between">
      {/* Top Header matching reference pill design */}
      <div>
        <div className="bg-slate-100 rounded-xl py-2.5 px-4 text-center font-bold text-slate-800 text-lg mb-5 shadow-2xs">
          {t.booking?.seat?.yourSelection ?? "Your Selection"}
        </div>

        {/* Selected List */}
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t.booking?.seat?.selected ?? "Selected"}:
        </h3>

        {assignedCount === 0 ? (
          <div className="text-sm text-slate-500 py-8 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <p className="font-medium text-slate-700">{t.booking?.seat?.noSeats ?? "No seats selected"}</p>
            <p className="text-xs text-slate-400 mt-1">
              {t.booking?.seat?.selectUpTo ?? "Select up to"} {passengerCount} {(t.booking?.seat?.seat ?? "seat").toLowerCase()}{passengerCount > 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 mb-6">
            {seatDetails.map((detail, i) => {
              if (!detail) {
                return (
                  <div
                    key={`unassigned-${i}`}
                    className="py-3 flex items-center justify-between text-slate-400 opacity-60 text-xs"
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
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <span className="font-bold">{t.booking?.seat?.seat ?? "Seat"} {detail.seatNumber}</span>
                    <span className="text-xs text-slate-500">
                      ({detail.cabinName}, {detail.position})
                    </span>
                  </div>

                  <div className="text-right font-bold text-slate-900">
                    - ${detail.price > 0 ? detail.price.toLocaleString() : "0"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Summary & Actions */}
      <div className="pt-4 border-t border-slate-200 mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-600">
            {t.booking?.summary?.total ?? "Total"}:
          </span>
          <span className="text-xl font-black text-slate-900">
            ${totalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-5">
          <span>{t.booking?.seat?.seatsCurrent ?? "Seats Assigned"}</span>
          <span
            className={
              isComplete ? "text-emerald-600 font-bold" : "text-slate-600"
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
            className="w-full h-11 rounded-xl text-sm font-semibold bg-slate-200/80 hover:bg-slate-300 border-0 text-slate-700 transition-colors"
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
