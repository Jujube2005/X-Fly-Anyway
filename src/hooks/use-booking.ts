"use client";

import { useState, useCallback } from "react";
import type { Booking, CreateBookingPayload } from "@/types/booking";

interface UseBookingReturn {
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  createBooking: (payload: CreateBookingPayload) => Promise<Booking | null>;
  fetchBooking: (reference: string) => Promise<void>;
  clearBooking: () => void;
}

/**
 * useBooking — manages booking creation and retrieval state.
 * Client-side hook; calls the /api/bookings endpoint.
 */
export function useBooking(): UseBookingReturn {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (payload: CreateBookingPayload): Promise<Booking | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create booking");
        const data: Booking = await res.json();
        setBooking(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchBooking = useCallback(async (reference: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?ref=${encodeURIComponent(reference)}`);
      if (!res.ok) throw new Error("Booking not found");
      const data: Booking = await res.json();
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearBooking = useCallback(() => {
    setBooking(null);
    setError(null);
  }, []);

  return { booking, isLoading, error, createBooking, fetchBooking, clearBooking };
}
