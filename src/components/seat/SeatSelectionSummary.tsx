"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
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
  const assignedCount = selectedSeats.filter(Boolean).length;
  const isComplete = assignedCount === passengerCount;

  // Format cabin class for display (e.g. "economy" -> "Economy", "premium_economy" -> "Economy Plus")
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
    <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#f5c800]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            Your Selection
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {assignedCount}/{passengerCount} Selected
          </span>
        </div>

        {/* Selected List */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Selected:
        </h3>

        {assignedCount === 0 ? (
          <div className="text-sm text-slate-500 py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <svg
              className="w-8 h-8 text-slate-300 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="font-medium text-slate-700">No seats selected yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Select {passengerCount} seat{passengerCount > 1 ? "s" : ""} on the
              aircraft map
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 mb-6">
            {seatDetails.map((detail, i) => {
              if (!detail) {
                return (
                  <div
                    key={`unassigned-${i}`}
                    className="py-3 flex items-center justify-between text-slate-400 opacity-60"
                  >
                    <span className="text-sm font-medium">Passenger {i + 1}</span>
                    <span className="text-xs italic">Seat unassigned</span>
                  </div>
                );
              }

              return (
                <div
                  key={detail.seatNumber}
                  className="py-3.5 flex items-start justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-base">
                      Seat {detail.seatNumber}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {detail.cabinName} &middot; {detail.position}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      {detail.price > 0 ? `$${detail.price.toLocaleString()}` : "$0"}
                    </span>
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
            Total Seat Selection:
          </span>
          <span className="text-xl font-black text-slate-900">
            ${totalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-6">
          <span>Seats Assigned</span>
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
            className="w-full h-11 rounded-xl text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Change Selection
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!isComplete}
            className="w-full h-12 rounded-xl text-base font-bold bg-[#f5c800] text-slate-950 hover:bg-[#e6bb00] shadow-md transition-all disabled:opacity-50"
          >
            {isNextFlight ? "Next Flight" : "Confirm Seats"}
          </Button>
        </div>
      </div>
    </div>
  );
}
