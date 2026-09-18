"use client";

import { PassengerInput } from "@/components/booking/BookingProvider";

interface PassengerSelectorProps {
  passengers: PassengerInput[]; // Or just passenger count if details are not ready
  passengerCount: number;
  activePassengerIndex: number;
  onSelectPassenger: (index: number) => void;
  selectedSeats: string[]; // Seats currently assigned per passenger index
}

export function PassengerSelector({
  passengerCount,
  activePassengerIndex,
  onSelectPassenger,
  selectedSeats,
}: PassengerSelectorProps) {
  if (passengerCount <= 1) return null;

  const passengers = Array.from({ length: passengerCount }).map((_, i) => ({
    id: i,
    name: `Passenger ${i + 1}`,
  }));

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
      {passengers.map((p, index) => {
        const isActive = activePassengerIndex === index;
        const hasSeat = !!selectedSeats[index];

        return (
          <button
            key={p.id}
            onClick={() => onSelectPassenger(index)}
            className={`flex flex-col items-start min-w-[120px] p-3 rounded-xl border transition-all ${
              isActive
                ? "border-[#f5c800] bg-[#fdf8e6] shadow-sm"
                : "border-[#e5e7eb] bg-white hover:border-[#d1d5db]"
            }`}
          >
            <span className={`text-xs font-bold ${isActive ? "text-[#b48c00]" : "text-[#4b5563]"}`}>
              {p.name}
            </span>
            <span className={`text-sm mt-1 ${hasSeat ? "text-[#111827] font-semibold" : "text-[#9ca3af]"}`}>
              {hasSeat ? `Seat ${selectedSeats[index]}` : "Select seat"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
