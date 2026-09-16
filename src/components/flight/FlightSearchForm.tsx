"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookingContext } from "@/components/booking/BookingProvider";
import type { Airport } from "@/types/flight";
import { useTranslation } from "@/hooks/useTranslation";
import { AirportAutocomplete } from "@/components/ui/AirportAutocomplete";

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 16V4M7 4L3 8M7 4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8v12M17 20l4-4M17 20l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlightSearchFormProps {
  onSearch?: () => void;
  /** When this changes, destination state is updated (popular destination click). */
  defaultDestination?: string;
  /** When this changes, origin state is updated. */
  defaultOrigin?: string;
}

type FormErrors = Partial<Record<
  "origin" | "destination" | "sameAirport" | "departureDate" | "returnDate" | "passengers" | "international",
  string
>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if either airport is outside Thailand. */
function isInternational(origin: Airport | undefined, dest: Airport | undefined): boolean {
  if (!origin || !dest) return false;
  return origin.country_code !== "TH" || dest.country_code !== "TH";
}

/** Returns today's date as YYYY-MM-DD in local time. */
function todayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlightSearchForm({
  onSearch,
  defaultDestination,
  defaultOrigin,
}: FlightSearchFormProps) {
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
  const [errors, setErrors] = useState<FormErrors>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  const [tripType, setTripType] = useState<"one_way" | "round_trip">("one_way");
  const [returnDate, setReturnDate] = useState("");

  // Derived airport objects
  const originAirport = useMemo(
    () => airports.find((a) => a.airport_code === origin),
    [airports, origin]
  );
  const destAirport = useMemo(
    () => airports.find((a) => a.airport_code === destination),
    [airports, destination]
  );

  // International route detection (single source of truth)
  const isIntl = useMemo(
    () => isInternational(originAirport, destAirport),
    [originAirport, destAirport]
  );

  // Auto-select round-trip for international routes
  useEffect(() => {
    if (isIntl) setTripType("round_trip");
  }, [isIntl]);

  // Apply defaultDestination override (popular destination click)
  // Only runs when the prop changes, not on every render.
  useEffect(() => {
    if (defaultDestination) setDestination(defaultDestination);
  }, [defaultDestination]);

  useEffect(() => {
    if (defaultOrigin) setOrigin(defaultOrigin);
  }, [defaultOrigin]);

  // Popover close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
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

  // Fetch airports
  const fetchAirports = useCallback(async () => {
    try {
      const res = await fetch("/api/airports", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.airports) setAirports(data.airports);
      }
    } catch {
      // Silent: airports will just be empty
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchAirports();
    setDepartureDate(todayStr());
  }, [fetchAirports]);

  // ─── Swap ────────────────────────────────────────────────────────────────

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
    setErrors({});
  }

  // ─── Validation ──────────────────────────────────────────────────────────

  function validate(): FormErrors {
    const today = todayStr();
    const errs: FormErrors = {};

    if (!origin) errs.origin = "กรุณาเลือกสนามบินต้นทาง";
    if (!destination) errs.destination = "กรุณาเลือกสนามบินปลายทาง";

    if (origin && destination && origin === destination) {
      errs.sameAirport = "ต้นทางและปลายทางต้องไม่ใช่สนามบินเดียวกัน";
    }

    if (!departureDate) {
      errs.departureDate = "กรุณาเลือกวันเดินทางไป";
    } else if (departureDate < today) {
      errs.departureDate = "วันเดินทางไปต้องไม่เป็นวันที่ผ่านมาแล้ว";
    }

    if (tripType === "round_trip") {
      if (!returnDate) {
        errs.returnDate = "กรุณาเลือกวันเดินทางกลับ";
      } else if (departureDate && returnDate < departureDate) {
        errs.returnDate = "วันเดินทางกลับต้องไม่ก่อนวันออกเดินทาง";
      }
    }

    if (isIntl && tripType !== "round_trip") {
      errs.international = "เที่ยวบินระหว่างประเทศจำเป็นต้องระบุวันเดินทางกลับ";
    }

    if (isIntl && tripType === "round_trip" && !returnDate) {
      errs.returnDate = "เที่ยวบินระหว่างประเทศต้องระบุวันเดินทางกลับ";
    }

    if (passengers < 1 || passengers > 9) {
      errs.passengers = "จำนวนผู้โดยสารต้องอยู่ระหว่าง 1–9 คน";
    }

    return errs;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setPassengerCount(passengers);

    const params = new URLSearchParams({
      origin,
      destination,
      date: departureDate,        // flights page reads "date=" — preserve contract
      passengers: String(passengers),
      cabinClass,
      tripType,
    });

    if (tripType === "round_trip" && returnDate) {
      params.append("returnDate", returnDate);
    }

    onSearch?.();
    router.push(`/flights?${params}`);
  }

  // ─── Passenger summary label ──────────────────────────────────────────────

  const cabinLabel =
    cabinClass === "premium_economy"
      ? t.search.cabinClass.premium_economy
      : cabinClass === "economy"
      ? t.search.cabinClass.economy
      : cabinClass === "business"
      ? t.search.cabinClass.business
      : t.search.cabinClass.first;

  const passengerSummary = [
    adults > 0 ? `${adults} ผู้ใหญ่` : null,
    children > 0 ? `${children} เด็ก` : null,
    infants > 0 ? `${infants} ทารก` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // ─── Style tokens ─────────────────────────────────────────────────────────

  const inputBase =
    "w-full bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all duration-200";

  const inputError =
    "w-full bg-white/15 backdrop-blur-sm border border-red-400/70 text-white placeholder:text-white/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all duration-200";

  const labelBase = "block text-xs font-medium text-white/60 mb-1";

  const errorMsg = "text-red-400 text-xs mt-1 flex items-center gap-1";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="w-full" aria-label="Flight search" noValidate>

      {/* ── Trip Type ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 mb-4">
        <label
          className={`flex items-center text-sm cursor-pointer font-medium transition-colors ${
            isIntl
              ? "text-white/35 cursor-not-allowed"
              : "text-white/90 hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="tripType"
            value="one_way"
            checked={tripType === "one_way"}
            onChange={() => {
              setTripType("one_way");
              setErrors((prev) => ({ ...prev, returnDate: undefined, international: undefined }));
            }}
            disabled={isIntl}
            className="mr-2 accent-[#f5c800] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className={isIntl ? "line-through decoration-white/30" : ""}>
            เที่ยวเดียว
          </span>
        </label>

        <label className="flex items-center text-white/90 text-sm cursor-pointer font-medium hover:text-white transition-colors">
          <input
            type="radio"
            name="tripType"
            value="round_trip"
            checked={tripType === "round_trip"}
            onChange={() => {
              setTripType("round_trip");
              setErrors((prev) => ({ ...prev, international: undefined }));
            }}
            className="mr-2 accent-[#f5c800] w-4 h-4 cursor-pointer"
          />
          ไป-กลับ
        </label>

        {/* International warning — inline, not alert */}
        {isIntl && (
          <span className="ml-auto text-xs text-[#f5c800] font-medium bg-[#f5c800]/10 border border-[#f5c800]/30 rounded-lg px-3 py-1 leading-snug">
            ✈ ระหว่างประเทศ · ต้องไป-กลับ
          </span>
        )}
      </div>

      {/* ── Origin / Swap / Destination ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 mb-3">
        {/* Origin */}
        <div className="relative">
          <label htmlFor="origin" className={labelBase}>
            ต้นทาง
          </label>
          <AirportAutocomplete
            id="origin"
            value={origin}
            onChange={(v) => {
              setOrigin(v);
              setErrors((prev) => ({ ...prev, origin: undefined, sameAirport: undefined }));
            }}
            airports={airports}
            placeholder={t.search.from}
            className={errors.origin || errors.sameAirport ? inputError : inputBase}
          />
          {errors.origin && (
            <p className={errorMsg} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {errors.origin}
            </p>
          )}
        </div>

        {/* Swap button — positioned in grid between fields on sm+ */}
        <div className="hidden sm:flex items-center justify-center pt-5">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="สลับต้นทางและปลายทาง"
            title="สลับต้นทางและปลายทาง"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:border-[#f5c800]/50 hover:text-[#f5c800] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#f5c800]"
            suppressHydrationWarning
          >
            <SwapIcon />
          </button>
        </div>

        {/* Destination */}
        <div className="relative">
          <label htmlFor="destination" className={labelBase}>
            ปลายทาง
          </label>
          <AirportAutocomplete
            id="destination"
            value={destination}
            onChange={(v) => {
              setDestination(v);
              setErrors((prev) => ({ ...prev, destination: undefined, sameAirport: undefined }));
            }}
            airports={airports}
            placeholder={t.search.to}
            className={errors.destination || errors.sameAirport ? inputError : inputBase}
          />
          {errors.destination && (
            <p className={errorMsg} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {errors.destination}
            </p>
          )}
        </div>

          {errors.sameAirport && (
            <p className={`${errorMsg} -mt-1`} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {errors.sameAirport}
            </p>
          )}
      </div>

      {/* Mobile swap button */}
      <div className="flex justify-center mb-3 sm:hidden">
        <button
          type="button"
          onClick={handleSwap}
          aria-label="สลับต้นทางและปลายทาง"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-[#f5c800] transition-colors px-3 py-1.5 rounded-lg border border-white/20 hover:border-[#f5c800]/40"
        >
          <SwapIcon />
          สลับ
        </button>
      </div>

      {/* ── Date / Passengers / Search ─────────────────────────────────────── */}
      <div
        className={`grid grid-cols-1 gap-3 ${
          tripType === "round_trip" ? "sm:grid-cols-4" : "sm:grid-cols-3"
        }`}
      >
        {/* Departure date */}
        <div>
          <label htmlFor="departure-date" className={labelBase}>
            วันเดินทางไป
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
              <CalendarIcon />
            </span>
            <input
              id="departure-date"
              type="date"
              value={departureDate}
              onChange={(e) => {
                setDepartureDate(e.target.value);
                setErrors((prev) => ({ ...prev, departureDate: undefined }));
                if (returnDate && e.target.value > returnDate) {
                  setReturnDate("");
                  setErrors((prev) => ({ ...prev, returnDate: undefined }));
                }
              }}
              className={`${errors.departureDate ? inputError : inputBase} pl-10`}
              min={todayStr()}
              aria-label="Departure date"
            />
          </div>
          {errors.departureDate && (
            <p className={errorMsg} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {errors.departureDate}
            </p>
          )}
        </div>

        {/* Return date */}
        {tripType === "round_trip" && (
          <div>
            <label htmlFor="return-date" className={labelBase}>
              วันเดินทางกลับ
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                <CalendarIcon />
              </span>
              <input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  setErrors((prev) => ({ ...prev, returnDate: undefined }));
                }}
                className={`${errors.returnDate ? inputError : inputBase} pl-10`}
                min={departureDate || todayStr()}
                aria-label="Return date"
              />
            </div>
            {errors.returnDate && (
              <p className={errorMsg} role="alert">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                {errors.returnDate}
              </p>
            )}
          </div>
        )}

        {/* Passengers + Cabin class popover */}
        <div className="relative" ref={popoverRef}>
          <label className={labelBase}>ผู้โดยสาร</label>
          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`${inputBase} pl-10 text-left flex items-center justify-between`}
            aria-haspopup="dialog"
            aria-expanded={isPopoverOpen}
            suppressHydrationWarning
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
              <PassengerIcon />
            </span>
            <span className="truncate">
              {passengerSummary}, {cabinLabel}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/50 shrink-0 ml-2">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {errors.passengers && (
            <p className={errorMsg} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {errors.passengers}
            </p>
          )}

          {isPopoverOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="เลือกผู้โดยสารและชั้นโดยสาร"
              className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-xl z-50 p-5 border border-gray-100 text-gray-900 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* Passenger rows */}
              <h4 className="font-bold text-base text-gray-900 mb-5">จำนวนผู้โดยสาร</h4>

              {/* Adults */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <PassengerIcon />
                  <div>
                    <p className="font-semibold text-sm">ผู้ใหญ่</p>
                    <p className="text-xs text-gray-500">อายุตั้งแต่ 12 ปีขึ้นไป</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 font-bold text-lg"
                    aria-label="ลดผู้ใหญ่"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-semibold">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(9, adults + 1))}
                    disabled={passengers >= 9}
                    className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-gray-700 hover:bg-sky-200 font-bold text-lg"
                    aria-label="เพิ่มผู้ใหญ่"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">♧</span>
                  <div>
                    <p className="font-semibold text-sm">เด็ก</p>
                    <p className="text-xs text-gray-500">2–11 ปี</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 font-bold text-lg"
                    aria-label="ลดเด็ก"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-semibold">{children}</span>
                  <button
                    type="button"
                    onClick={() => { if (passengers < 9) setChildren(children + 1); }}
                    disabled={passengers >= 9}
                    className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-gray-700 hover:bg-sky-200 font-bold text-lg"
                    aria-label="เพิ่มเด็ก"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">◉</span>
                  <div>
                    <p className="font-semibold text-sm">ทารก</p>
                    <p className="text-xs text-gray-500">ต่ำกว่า 2 ปี</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants <= 0}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 font-bold text-lg"
                    aria-label="ลดทารก"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-semibold">{infants}</span>
                  <button
                    type="button"
                    onClick={() => { if (passengers < 9) setInfants(infants + 1); }}
                    disabled={passengers >= 9}
                    className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-gray-700 hover:bg-sky-200 font-bold text-lg"
                    aria-label="เพิ่มทารก"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-6" />

              {/* Cabin Class */}
              <div>
                <h4 className="font-bold text-base text-gray-900 mb-3">ชั้นโดยสาร</h4>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 text-sm text-gray-800 bg-white focus:outline-none focus:border-sky-500"
                  aria-label="ชั้นโดยสาร"
                >
                  <option value="economy">{t.search.cabinClass.economy}</option>
                  <option value="premium_economy">{t.search.cabinClass.premium_economy}</option>
                  <option value="business">{t.search.cabinClass.business}</option>
                  <option value="first">{t.search.cabinClass.first}</option>
                </select>
              </div>

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

        {/* Search button */}
        <button
          type="submit"
          disabled={isLoading}
          className="self-end bg-[#f5c800] text-[#111827] font-bold rounded-xl py-3.5 px-6 hover:bg-[#e6b800] active:bg-[#c9a200] transition-colors duration-200 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#f5c800] focus-visible:outline-offset-2 flex items-center justify-center gap-2"
          suppressHydrationWarning
        >
          {isLoading ? (
            <>
              <SpinnerIcon />
              {t.search.searching}
            </>
          ) : (
            t.search.searchFlights
          )}
        </button>
      </div>

      {/* International summary error (fallback) */}
      {errors.international && (
        <p className={`${errorMsg} mt-2`} role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          {errors.international}
        </p>
      )}
    </form>
  );
}
