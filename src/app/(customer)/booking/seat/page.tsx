"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { useSeats } from "@/hooks/use-seats";
import { AircraftShell } from "@/components/seat/AircraftShell";
import { SeatMap } from "@/components/seat/SeatMap";
import { PassengerSelector } from "@/components/seat/PassengerSelector";
import { SeatSelectionSummary } from "@/components/seat/SeatSelectionSummary";
import "./page.css";

export default function SeatSelectionPage() {
  const router = useRouter();
  const { selectedLegs, cabinClass, selectedSeats, setSelectedSeats, passengerCount, passengers } =
    useBookingContext();
  const { layout, seatsInfo, isLoading, error, fetchSeatMap } = useSeats();
  const { t } = useTranslation();

  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  // Fetch seat layout when the leg or cabin changes
  useEffect(() => {
    if (!selectedLegs || selectedLegs.length === 0 || !cabinClass) {
      router.replace("/");
      return;
    }
    fetchSeatMap(selectedLegs[currentLegIndex].id, cabinClass);
    setActivePassengerIndex(0); // reset passenger index when changing leg
  }, [selectedLegs, cabinClass, fetchSeatMap, router, currentLegIndex]);

  // Ensure currentLegSeats is always an array of length passengerCount
  const currentLegSeats: string[] = selectedSeats[currentLegIndex] || Array(passengerCount).fill("");

  function handleSeatClick(seatNumber: string) {
    const isSelectedByMe = currentLegSeats[activePassengerIndex] === seatNumber;
    
    let newLegSeats = [...currentLegSeats];
    
    if (isSelectedByMe) {
      // Deselect
      newLegSeats[activePassengerIndex] = "";
    } else {
      // Select (or swap)
      newLegSeats[activePassengerIndex] = seatNumber;
      
      // Auto-advance to next passenger without a seat
      const nextUnassigned = newLegSeats.findIndex((s) => !s);
      if (nextUnassigned !== -1) {
        setActivePassengerIndex(nextUnassigned);
      }
    }

    const updated = [...selectedSeats];
    updated[currentLegIndex] = newLegSeats;
    setSelectedSeats(updated);
  }

  function handleConfirm() {
    const assignedCount = currentLegSeats.filter(Boolean).length;
    if (assignedCount !== passengerCount) return;

    if (currentLegIndex < selectedLegs.length - 1) {
      setCurrentLegIndex((i) => i + 1);
    } else {
      router.push("/booking/passenger");
    }
  }

  function handleClearSelection() {
    const updated = [...selectedSeats];
    updated[currentLegIndex] = Array(passengerCount).fill("");
    setSelectedSeats(updated);
    setActivePassengerIndex(0);
  }

  const allSelectedSeats = currentLegSeats.filter(Boolean);

  return (
    <div className="min-h-dvh flex flex-col bg-[#f9fafb]">
      <Header variant="glass" />

      <main className="flex-1 flex flex-col items-center pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        {/* Title + stepper */}
        <div className="text-center mb-8 w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#111827] mb-2 font-display">
            Select Your Seats
          </h1>
          <p className="text-base text-[#6b7280] mb-6">
            {selectedLegs.length > 1
              ? `Flight ${currentLegIndex + 1} of ${selectedLegs.length}`
              : "Choose the perfect spot for your journey"}
          </p>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100">
             <BookingStepper currentLabel={t.booking.seat.seatsCurrent} variant="light" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
          {/* Main Seat Map Area */}
          <div className="flex-1 w-full max-w-3xl flex flex-col">
            
            {/* Passenger Selector */}
            {layout && !isLoading && !error && (
              <PassengerSelector
                passengers={passengers}
                passengerCount={passengerCount}
                activePassengerIndex={activePassengerIndex}
                onSelectPassenger={setActivePassengerIndex}
                selectedSeats={currentLegSeats}
              />
            )}

            {/* Aircraft Map */}
            <div className="w-full">
              {isLoading && <LoadingState message={t.booking.seat.loading} />}
              {!isLoading && error && (
                <ErrorState
                  message={error}
                  onRetry={() =>
                    selectedLegs &&
                    cabinClass &&
                    fetchSeatMap(selectedLegs[currentLegIndex].id, cabinClass)
                  }
                />
              )}
              {!isLoading && !error && !layout && (
                <EmptyState message={t.booking.seat.noSeats} />
              )}

              {layout && (
                <AircraftShell>
                  <SeatMap
                    layout={layout}
                    seatsInfo={seatsInfo}
                    currentLegSeats={currentLegSeats[activePassengerIndex] ? [currentLegSeats[activePassengerIndex]] : []}
                    allSelectedSeats={allSelectedSeats}
                    onSeatClick={handleSeatClick}
                    maxSeatsReached={false} // UX decision: allow clicking to swap seat instead of disabling
                  />
                </AircraftShell>
              )}
            </div>
          </div>

          {/* Right Summary Panel */}
          {layout && !isLoading && !error && (
            <SeatSelectionSummary
              passengerCount={passengerCount}
              selectedSeats={currentLegSeats}
              seatsInfo={seatsInfo}
              firstRow={layout.firstRow}
              cabinClass={cabinClass!}
              onConfirm={handleConfirm}
              onClear={handleClearSelection}
              isNextFlight={currentLegIndex < selectedLegs.length - 1}
            />
          )}
        </div>
      </main>
    </div>
  );
}
