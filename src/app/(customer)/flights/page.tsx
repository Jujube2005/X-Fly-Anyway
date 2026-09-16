"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FlightCard, FlightFilters } from "@/components/flight/FlightCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useBookingContext } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import type { Flight, FlightSearchResult, FlightCabinClassInfo } from "@/types/flight";
import "./page.css";

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSelectedFlight } = useBookingContext();
  const { t } = useTranslation();

  const [results, setResults] = useState<FlightSearchResult | null>(null);
  const [cabinMap, setCabinMap] = useState<Record<string, FlightCabinClassInfo[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCabin, setSelectedCabin] = useState(searchParams.get("cabinClass") ?? "");

  const origin = searchParams.get("origin") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const date = searchParams.get("date") ?? "";
  const passengers = searchParams.get("passengers") ?? "1";

  const searchFlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ origin, destination, date, passengers });
      if (selectedCabin) q.set("cabinClass", selectedCabin);
      const res = await fetch(`/api/flights?${q}`);
      if (!res.ok) throw new Error("Failed to load flights");
      const data: FlightSearchResult = await res.json();
      setResults(data);

      // Build cabin map
      const map: Record<string, FlightCabinClassInfo[]> = {};
      for (const f of data.flights ?? []) {
        map[f.id] = f.cabinClasses ?? [];
      }
      setCabinMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, date, passengers, selectedCabin]);

  useEffect(() => {
    // eslint-disable-next-line
    if (origin && destination && date) searchFlights();
  }, [searchFlights, origin, destination, date]);

  function handleSelect(flight: Flight) {
    setSelectedFlight(flight);
    router.push("/booking/cabin");
  }

  const cabinLabel = selectedCabin
    ? selectedCabin.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())
    : "Economy";
  const summaryText = [
    origin && destination ? `${origin} → ${destination}` : "",
    date,
    `${passengers} ${Number(passengers) > 1 ? t.flights.passengers : t.flights.passenger}`,
    cabinLabel,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="min-h-dvh flights-page-container">
      <Header variant="glass" />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Search bar row */}
          <div className="flex items-center justify-between gap-4 rounded-2xl px-5 py-3 mb-6 flights-search-bar">
            <div className="flex items-center gap-2 text-[#374151] text-sm">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5" stroke="#6b7280" strokeWidth="1.4" />
                <path d="M11 11l3 3" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="truncate">{summaryText}</span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="shrink-0 text-sm font-semibold border border-[#f5c800] text-[#c9a200] px-4 py-1.5 rounded-lg hover:bg-[#f5c800]/10 transition-colors"
            >
              {t.flights.modifySearch}
            </button>
          </div>

          <div className="flex gap-5 items-start">
            {/* Sidebar filters */}
            <aside className="w-52 shrink-0 hidden md:block sticky top-24">
              <FlightFilters
                selectedCabin={selectedCabin}
                onCabinChange={(c) => setSelectedCabin(c)}
              />
            </aside>

            {/* Flight list */}
            <section className="flex-1 min-w-0" aria-label="Flight results">
              {isLoading && <LoadingState message={t.flights.loading} />}
              {!isLoading && error && (
                <ErrorState message={error} onRetry={searchFlights} />
              )}
              {!isLoading && !error && results && (results.flights ?? []).length === 0 && (
                <EmptyState message={t.flights.noFlights} />
              )}
              {!isLoading && !error && results && (results.flights ?? []).length > 0 && (
                <div className="flex flex-col gap-3">
                  {(results.flights ?? []).map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      cabinClasses={cabinMap[flight.id] ?? []}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FlightsPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<LoadingState message={t.flights.loading} />}>
      <FlightResultsContent />
    </Suspense>
  );
}
