"use client";

import { useState, useCallback } from "react";
import type { SeatMap, Seat } from "@/types/seat";
import type { CabinClass } from "@/types/flight";

interface UseSeatsReturn {
  seatMap: SeatMap | null;
  selectedSeats: Seat[];
  isLoading: boolean;
  error: string | null;
  fetchSeatMap: (flightId: string, cabinClass: CabinClass) => Promise<void>;
  toggleSeat: (seat: Seat) => void;
  clearSelection: () => void;
}

/**
 * useSeats — manages seat map loading and seat selection state.
 * Client-side hook; calls the /api/seats endpoint.
 */
export function useSeats(): UseSeatsReturn {
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeatMap = useCallback(
    async (flightId: string, cabinClass: CabinClass) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/seats?flightId=${encodeURIComponent(flightId)}&cabin=${cabinClass}`
        );
        if (!res.ok) throw new Error("Failed to fetch seat map");
        const data: SeatMap = await res.json();
        setSeatMap(data);
        setSelectedSeats([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status === "occupied" || seat.status === "blocked") return;
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      return exists ? prev.filter((s) => s.id !== seat.id) : [...prev, seat];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  return {
    seatMap,
    selectedSeats,
    isLoading,
    error,
    fetchSeatMap,
    toggleSeat,
    clearSelection,
  };
}
