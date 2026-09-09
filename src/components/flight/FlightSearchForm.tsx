"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBookingContext } from "@/components/booking/BookingProvider";
import type { Airport } from "@/types/flight";
import { useTranslation } from "@/hooks/useTranslation";

// Takeoff icon
function TakeoffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 14l3-3 3 1 6-7-1 7-4-1-3 3H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Landing icon
function LandingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M17 14H3M5 10l3 3 3-1 6 2-1-5-4 1-3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h14M7 3v4M13 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PassengerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface FlightSearchFormProps {
  onSearch?: () => void;
}

export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const router = useRouter();
  const { setPassengerCount } = useBookingContext();
  const { t } = useTranslation();

  const [airports, setAirports] = useState<Airport[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAirports = useCallback(async () => {
    try {
      const res = await fetch("/api/flights?listAirports=true");
      if (res.ok) {
        const data = await res.json();
        if (data.airports) setAirports(data.airports);
      }
    } catch {
      // airports will just be empty — user can still type
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchAirports();
    // Pre-fill today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDepartureDate(`${yyyy}-${mm}-${dd}`);
  }, [fetchAirports]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;
    setIsLoading(true);
    setPassengerCount(passengers);
    const params = new URLSearchParams({
      origin,
      destination,
      date: departureDate,
      passengers: String(passengers),
      cabinClass,
    });
    onSearch?.();
    router.push(`/flights?${params}`);
  }

  const inputBase =
    "w-full bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all duration-200";

  const labelBase = "block text-xs font-medium text-white/60 mb-1";

  return (
    <form onSubmit={handleSubmit} className="w-full" aria-label="Flight search">
      {/* Row 1: From / To */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="origin" className={labelBase}>
            <TakeoffIcon />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              <TakeoffIcon />
            </span>
            <select
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className={`${inputBase} pl-10 appearance-none`}
              required
            >
              <option value="" disabled className="text-gray-900 bg-white">
                {t.search.from}
              </option>
              {airports.map((a) => (
                <option key={a.code} value={a.code} className="text-gray-900 bg-white">
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              <LandingIcon />
            </span>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={`${inputBase} pl-10 appearance-none`}
              required
            >
              <option value="" disabled className="text-gray-900 bg-white">
                {t.search.to}
              </option>
              {airports.map((a) => (
                <option key={a.code} value={a.code} className="text-gray-900 bg-white">
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Date / Passengers / Search button */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
            <CalendarIcon />
          </span>
          <input
            id="departure-date"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className={`${inputBase} pl-10`}
            min={new Date().toISOString().split("T")[0]}
            required
            aria-label="Departure date"
          />
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
            <PassengerIcon />
          </span>
          <select
            id="passengers"
            value={`${passengers}-${cabinClass}`}
            onChange={(e) => {
              const [p, c] = e.target.value.split("-");
              setPassengers(Number(p));
              setCabinClass(c);
            }}
            className={`${inputBase} pl-10 appearance-none`}
            aria-label="Passengers and cabin class"
          >
            {[1, 2, 3, 4, 5].map((n) =>
              ["economy", "premium_economy", "business", "first"].map((cls) => (
                <option
                  key={`${n}-${cls}`}
                  value={`${n}-${cls}`}
                  className="text-gray-900 bg-white"
                >
                  {n} {n === 1 ? t.search.adult : t.search.adults},{" "}
                  {cls === "premium_economy" ? t.search.cabinClass.premium_economy : cls === "economy" ? t.search.cabinClass.economy : cls === "business" ? t.search.cabinClass.business : t.search.cabinClass.first}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#f5c800] text-[#111827] font-bold rounded-xl py-3.5 px-6 hover:bg-[#e6b800] active:bg-[#c9a200] transition-colors duration-200 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#f5c800] focus-visible:outline-offset-2"
        >
          {isLoading ? t.search.searching : t.search.searchFlights}
        </button>
      </div>
    </form>
  );
}
