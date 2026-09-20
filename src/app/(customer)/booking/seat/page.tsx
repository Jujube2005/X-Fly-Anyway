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
import { SeatLegend } from "@/components/seat/SeatLegend";
import "./page.css";

export default function SeatSelectionPage() {
  const router = useRouter();
  const {
    selectedLegs,
    cabinClass,
    selectedSeats,
    setSelectedSeats,
    passengerCount,
    passengers,
  } = useBookingContext();
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
  }, [selectedLegs, cabinClass, fetchSeatMap, router, currentLegIndex]);

  // Ensure currentLegSeats is always an array of length passengerCount
  const currentLegSeats: string[] =
    selectedSeats[currentLegIndex] || Array(passengerCount).fill("");

  function handleSeatClick(seatNumber: string) {
    const isSelectedByMe = currentLegSeats[activePassengerIndex] === seatNumber;

    const newLegSeats = [...currentLegSeats];

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
      setActivePassengerIndex(0);
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
    <div 
      className="min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url("/images/BG/Cloud.png")' }}
    >
      <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-dvh">
        <Header variant="glass" />

        <main className="flex-1 flex flex-col items-center pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          {/* Title + Stepper */}
          <div className="text-center mb-8 w-full max-w-4xl mx-auto glass-text-contrast">
            <h1 className="text-3xl font-bold text-[#111827] mb-2 font-display">
              {t.booking?.seat?.title ?? "Select Your Seats"}
            </h1>
            <p className="text-base text-[#111827] mb-6 font-medium">
              {selectedLegs.length > 1
                ? `${t.booking?.summary?.flight ?? "Flight"} ${currentLegIndex + 1} / ${selectedLegs.length}`
                : ((t.booking?.seat as any)?.subtitle ?? "Choose the perfect spot for your journey")}
            </p>
            <div className="glass-panel p-4">
              <BookingStepper
                currentLabel={t.booking.seat.seatsCurrent}
                variant="light"
              />
            </div>
          </div>

        {/* Main Booking Layout: CSS Grid (Aircraft Area 70-75% | Selection Summary 25-30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Aircraft Area (Left Column: 70-75% on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0 w-full">
            {/* Passenger Selector (when passengerCount > 1) */}
            {layout && !isLoading && !error && (
              <PassengerSelector
                passengers={passengers}
                passengerCount={passengerCount}
                activePassengerIndex={activePassengerIndex}
                onSelectPassenger={setActivePassengerIndex}
                selectedSeats={currentLegSeats}
              />
            )}

            {/* Aircraft State Wrappers */}
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

            {/* Complete Horizontal Aircraft and Legend */}
            {layout && !isLoading && !error && (
              <>
                <AircraftShell>
                  <SeatMap
                    layout={layout}
                    seatsInfo={seatsInfo}
                    currentLegSeats={
                      currentLegSeats[activePassengerIndex]
                        ? [currentLegSeats[activePassengerIndex]]
                        : []
                    }
                    allSelectedSeats={allSelectedSeats}
                    onSeatClick={handleSeatClick}
                    maxSeatsReached={false}
                  />
                </AircraftShell>

                {/* Legend directly underneath AircraftShell */}
                <SeatLegend />
              </>
            )}
          </div>

          {/* SeatSelectionSummary (Right Column: 25-30% on desktop, normal grid item) */}
          {layout && !isLoading && !error && (
            <div className="lg:col-span-4 xl:col-span-3 min-w-0 w-full sticky top-24">
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
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
