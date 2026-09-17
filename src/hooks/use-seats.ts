"use client";

import { useState, useCallback } from "react";
import type { SeatLayout, SeatAvailabilityResponse } from "@/types/seat";
import type { CabinClass } from "@/types/flight";

interface UseSeatsReturn {
  layout: SeatLayout | null;
  /** Set of seat numbers (e.g. "12A") that are occupied or blocked. */
  occupiedSeats: Set<string>;
  isLoading: boolean;
  error: string | null;
  fetchSeatMap: (flightId: string, cabinClass: CabinClass) => Promise<void>;
}

/**
 * useSeats — manages seat layout and occupied-seat state.
 *
 * Calls GET /api/seats?flightId=...&cabin=... which returns:
 *   { layout: SeatLayout, occupiedSeats: string[] }
 *
 * The hook converts occupiedSeats to a Set for O(1) lookup.
 *
 * Seat *selection* state is NOT managed here — that belongs to BookingProvider.
 * This hook only answers:
 *   - What is the layout (rows, columns, firstRow)?
 *   - Which seats are occupied/blocked?
 */
export function useSeats(): UseSeatsReturn {
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
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
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ?? "Failed to fetch seat layout"
          );
        }
        const data: SeatAvailabilityResponse = await res.json();
        setLayout(data.layout);
        setOccupiedSeats(new Set(data.occupiedSeats));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLayout(null);
        setOccupiedSeats(new Set());
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    layout,
    occupiedSeats,
    isLoading,
    error,
    fetchSeatMap,
  };
}
