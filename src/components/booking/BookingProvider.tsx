"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Flight, CabinClass } from "@/types/flight";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PassengerInput {
  title: "Mr" | "Mrs" | "Ms" | "Master";
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "male" | "female" | "unspecified";
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingState {
  selectedLegs: Flight[]; // 1 for direct, 2 for connecting
  cabinClass: CabinClass | null;
  /** Seat numbers per leg, e.g. [["12A","12B"],["7C"]]. Index matches selectedLegs. */
  selectedSeats: string[][];
  passengers: PassengerInput[];
  contact: ContactInput | null;
  bookingRef: string | null;
  passengerCount: number;
}

interface BookingContextValue extends BookingState {
  setSelectedLegs: (legs: Flight[]) => void;
  setCabinClass: (c: CabinClass) => void;
  setSelectedSeats: (seats: string[][]) => void;
  setPassengers: (p: PassengerInput[]) => void;
  setContact: (c: ContactInput) => void;
  setBookingRef: (ref: string) => void;
  setPassengerCount: (n: number) => void;
  resetBooking: () => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const STORAGE_KEY = "xfa_booking_state";

const DEFAULT_STATE: BookingState = {
  selectedLegs: [],
  cabinClass: null,
  selectedSeats: [],
  passengers: [],
  contact: null,
  bookingRef: null,
  passengerCount: 1,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextValue | null>(null);

function loadFromStorage(): BookingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveToStorage(state: BookingState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — ignore
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    // eslint-disable-next-line
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist every state change
  useEffect(() => {
    if (hydrated) saveToStorage(state);
  }, [state, hydrated]);

  const update = useCallback((partial: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        setSelectedLegs: (legs) => update({ selectedLegs: legs }),
        setCabinClass: (c) => update({ cabinClass: c }),
        setSelectedSeats: (seats) => update({ selectedSeats: seats }),
        setPassengers: (p) => update({ passengers: p }),
        setContact: (c) => update({ contact: c }),
        setBookingRef: (ref) => update({ bookingRef: ref }),
        setPassengerCount: (n) =>
          update({ passengerCount: n, passengers: [], selectedSeats: [] }),
        resetBooking: () => {
          sessionStorage.removeItem(STORAGE_KEY);
          setState(DEFAULT_STATE);
        },
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBookingContext(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookingContext must be used inside BookingProvider");
  return ctx;
}
