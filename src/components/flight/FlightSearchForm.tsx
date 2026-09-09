"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const passengers = adults + children + infants;
  const [cabinClass, setCabinClass] = useState("economy");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

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

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`${inputBase} pl-10 text-left flex items-center justify-between`}
            aria-haspopup="dialog"
            aria-expanded={isPopoverOpen}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
              <PassengerIcon />
            </span>
            <span className="truncate">
              {passengers} {passengers === 1 ? t.search.adult : t.search.adults},{" "}
              {cabinClass === "premium_economy" ? t.search.cabinClass.premium_economy : cabinClass === "economy" ? t.search.cabinClass.economy : cabinClass === "business" ? t.search.cabinClass.business : t.search.cabinClass.first}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/50 shrink-0 ml-2">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {isPopoverOpen && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-72 bg-white rounded-2xl shadow-xl z-50 p-5 border border-gray-100 text-gray-900 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Passengers */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{t.search.passengers}</h4>
                    <p className="text-xs text-gray-500">{t.search.adults}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span className="w-4 text-center font-semibold text-sm">{passengers}</span>
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      disabled={passengers >= 9}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-gray-100 mb-5 w-full" />
              
              {/* Cabin Class */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-3">
                  {t.flights?.cabinClass || "Cabin Class"}
                </h4>
                <div className="flex flex-col gap-2">
                  {(["economy", "premium_economy", "business", "first"] as const).map((cls) => (
                    <label key={cls} className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="cabinClass"
                          value={cls}
                          checked={cabinClass === cls}
                          onChange={() => setCabinClass(cls)}
                          className="w-5 h-5 border-2 border-gray-300 rounded-full appearance-none checked:border-[#f5c800] transition-colors cursor-pointer"
                        />
                        {cabinClass === cls && (
                          <div className="absolute w-2.5 h-2.5 rounded-full bg-[#f5c800] pointer-events-none" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {cls === "premium_economy" ? t.search.cabinClass.premium_economy : cls === "economy" ? t.search.cabinClass.economy : cls === "business" ? t.search.cabinClass.business : t.search.cabinClass.first}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
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
