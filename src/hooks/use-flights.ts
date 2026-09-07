"use client";

import { useState, useCallback } from "react";
import type {
  FlightSearchParams,
  FlightSearchResult,
  Flight,
} from "@/types/flight";

interface UseFlightsReturn {
  results: FlightSearchResult | null;
  selectedFlight: Flight | null;
  isLoading: boolean;
  error: string | null;
  searchFlights: (params: FlightSearchParams) => Promise<void>;
  selectFlight: (flight: Flight) => void;
  clearResults: () => void;
}

/**
 * useFlights — manages flight search state and interactions.
 * Client-side hook; calls the /api/flights endpoint.
 */
export function useFlights(): UseFlightsReturn {
  const [results, setResults] = useState<FlightSearchResult | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = useCallback(async (params: FlightSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryObj: Record<string, string> = {
        origin:     params.originCode,
        destination: params.destinationCode,
        date:       params.departureDate,
        passengers: String(params.passengers),
      };
      if (params.cabinClass) {
        queryObj.cabinClass = params.cabinClass;
      }
      const query = new URLSearchParams(queryObj);
      const res = await fetch(`/api/flights?${query}`);
      if (!res.ok) throw new Error("Failed to fetch flights");
      const data: FlightSearchResult = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setSelectedFlight(null);
    setError(null);
  }, []);

  return { results, selectedFlight, isLoading, error, searchFlights, selectFlight, clearResults };
}
