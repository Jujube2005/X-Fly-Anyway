"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBookingContext } from "@/components/booking/BookingProvider";
import type { Airport } from "@/types/flight";
import { useTranslation } from "@/hooks/useTranslation";
import { log } from "console";

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
      const res = await fetch("/api/airports");
      console.log("Status API is: ", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Data is: ", data);
        if (data.airports) setAirports(data.airports);
      }
    } catch {
      console.log("Error: ");
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
          <div className="relative">
            <select
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className={`${inputBase} appearance-none`}
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
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={`${inputBase} appearance-none`}
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
            className={`${inputBase}`}
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
              {passengers} {passengers === 1 ? "ผู้ใหญ่" : "ผู้ใหญ่"},
              {" "}
              {cabinClass === "premium_economy"
                ? t.search.cabinClass.premium_economy
                : cabinClass === "economy"
                  ? t.search.cabinClass.economy
      : cabinClass === "business"
        ? t.search.cabinClass.business
        : t.search.cabinClass.first}
</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/50 shrink-0 ml-2">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {isPopoverOpen && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-xl z-50 p-5 border border-gray-100 text-gray-900 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Passenger Count */}
              <div>
                <h4 className="font-bold text-base text-gray-900 mb-5">
                  จำนวนผู้โดยสาร
                </h4>

                {/* Adult */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <PassengerIcon />

                    <div>
                      <p className="font-semibold text-sm">ผู้ใหญ่</p>
                      <p className="text-xs text-gray-500">
                        อายุตั้งแต่ 12 ปีขึ้นไป
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="w-4 text-center font-semibold">
                      {adults}
                    </span>

                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(9, adults + 1))}
                      disabled={passengers >= 9}
                      className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-gray-700 hover:bg-sky-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Child */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">♧</span>

                    <div>
                      <p className="font-semibold text-sm">เด็ก</p>
                      <p className="text-xs text-gray-500">
                        2–11 ปี
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="w-4 text-center font-semibold">
                      {children}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (passengers < 9) {
                          setChildren(children + 1);
                        }
                      }}
                      disabled={passengers >= 9}
                      className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-gray-700 hover:bg-sky-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infant */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">◉</span>

                    <div>
                      <p className="font-semibold text-sm">ทารก</p>
                      <p className="text-xs text-gray-500">
                        ต่ำกว่า 2 ปี
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="w-4 text-center font-semibold">
                      {infants}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (passengers < 9) {
                          setInfants(infants + 1);
                        }
                      }}
                      disabled={passengers >= 9}
                      className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-gray-700 hover:bg-sky-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-6" />

              {/* Cabin Class */}
              <div>
                <h4 className="font-bold text-base text-gray-900 mb-3">
                  ชั้นโดยสาร
                </h4>

                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 text-sm text-gray-800 bg-white focus:outline-none focus:border-sky-500"
                >
                  <option value="economy">
                    {t.search.cabinClass.economy}
                  </option>

                  <option value="premium_economy">
                    {t.search.cabinClass.premium_economy}
                  </option>

                  <option value="business">
                    {t.search.cabinClass.business}
                  </option>

                  <option value="first">
                    {t.search.cabinClass.first}
                  </option>
                </select>
              </div>

              {/* Done */}
              <button
                type="button"
                onClick={() => setIsPopoverOpen(false)}
                className="w-full mt-5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl py-3.5 transition-colors"
              >
                เสร็จสิ้น
              </button>
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
