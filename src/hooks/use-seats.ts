"use client";

import { useState, useCallback } from "react";
import type { SeatLayout, SeatAvailabilityResponse, SeatInfo } from "@/types/seat";
import type { CabinClass } from "@/types/flight";

interface UseSeatsReturn {
  layout: SeatLayout | null;
  /** Detailed info for all seats. */
  seatsInfo: Record<string, SeatInfo>;
  isLoading: boolean;
  error: string | null;
  fetchSeatMap: (flightId: string, cabinClass: CabinClass) => Promise<void>;
}

/**
 * useSeats — manages seat layout and occupied-seat state.
 *
 * Calls GET /api/seats?flightId=...&cabin=... which returns:
 *   { layout: SeatLayout, seatsInfo: Record<string, {...}> }
 *
 * The hook exposes seatsInfo for rendering seat types and status.
 *
 * Seat *selection* state is NOT managed here — that belongs to BookingProvider.
 * This hook only answers:
 *   - What is the layout (rows, columns, firstRow)?
 *   - What are the detailed states and types of the seats?
 */
export function useSeats(): UseSeatsReturn {
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [seatsInfo, setSeatsInfo] = useState<SeatAvailabilityResponse['seatsInfo']>({});
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
        setLayout(data.layout || null);
        setSeatsInfo(data.seatsInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLayout(null);
        setSeatsInfo({});
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    layout,
    seatsInfo,
    isLoading,
    error,
    fetchSeatMap,
  };
}
