import { useBookingContext } from "@/components/booking/BookingProvider";
import type { Flight, FlightCabinClassInfo } from "@/types/flight";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCurrency } from "@/lib/utils/currency";
import "./FlightCard.css";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(dep: string, arr: string) {
  const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

function PlaneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M1 10.5l2-2 3 1 5-6-1 6-3-1-2 2H1zM7 3l2-1 4 3-1 1-4-2L7 3z" />
    </svg>
  );
}

interface FlightCardProps {
  flight: Flight;
  cabinClasses: FlightCabinClassInfo[];
  onSelect: (flight: Flight) => void;
  isSelected?: boolean;
}

export function FlightCard({ flight, cabinClasses, onSelect, isSelected = false }: FlightCardProps) {
  const { language, currency } = useLocale();

  const cheapest = cabinClasses.reduce<FlightCabinClassInfo | null>((min, c) => {
    if (!min || c.price < min.price) return c;
    return min;
  }, null);

  const priceDisplay = cheapest
    ? formatCurrency(cheapest.price, currency, language, cheapest.currency)
    : "—";

  const statusVariant = (): "confirmed" | "yellow" | "grey" | "red" => {
    switch (flight.status) {
      case "scheduled": return "confirmed";
      case "boarding": return "yellow";
      case "departed":
      case "arrived": return "grey";
      case "cancelled": return "red";
      default: return "grey";
    }
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-[#f5c800] shadow-lg shadow-[#f5c800]/20"
          : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: airline info + route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {/* Airline logo placeholder */}
            <div className="w-8 h-8 rounded-lg bg-[#f5c800]/20 flex items-center justify-center">
              <PlaneIcon />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#111827]">
                {flight.flightNumber}
              </span>
              <Badge variant={statusVariant()} className="ml-2">
                {flight.status}
              </Badge>
            </div>
          </div>

          {/* Route timeline */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-base font-bold text-[#111827]">
                {formatTime(flight.departureAt)}
              </p>
              <p className="text-xs text-[#6b7280]">{flight.origin.code}</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
              <p className="text-xs text-[#6b7280]">
                {formatDuration(flight.departureAt, flight.arrivalAt)}
              </p>
              <div className="flex items-center w-full gap-1">
                <div className="flex-1 h-px bg-[#e5e7eb]" />
                <PlaneIcon />
                <div className="flex-1 h-px bg-[#e5e7eb]" />
              </div>
              <p className="text-xs text-[#6b7280]">
                {cabinClasses.length === 0 ? "" : "Non-stop"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-base font-bold text-[#111827]">
                {formatTime(flight.arrivalAt)}
              </p>
              <p className="text-xs text-[#6b7280]">{flight.destination.code}</p>
            </div>
          </div>
        </div>

        {/* Right: price + select */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <p className="text-2xl font-bold text-[#f5c800]">{priceDisplay}</p>
          <button
            onClick={() => onSelect(flight)}
            className="bg-[#f5c800] text-[#111827] font-semibold text-sm px-5 py-2 rounded-xl hover:bg-[#e6b800] active:bg-[#c9a200] transition-colors focus-visible:outline-2 focus-visible:outline-[#f5c800]"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

// Sidebar cabin class filter
interface FlightFiltersProps {
  selectedCabin: string;
  onCabinChange: (c: string) => void;
}

export function FlightFilters({ selectedCabin, onCabinChange }: FlightFiltersProps) {
  const cabins = [
    { value: "", label: "All Classes" },
    { value: "economy", label: "Economy" },
    { value: "premium_economy", label: "Premium Economy" },
    { value: "business", label: "Business" },
    { value: "first", label: "First" },
  ];

  return (
    <div className="rounded-2xl p-5 flight-filters-glass">
      <h2 className="text-base font-bold text-white mb-4">Filters</h2>

      <div>
        <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">
          Cabin Class
        </p>
        <div className="flex flex-col gap-2">
          {cabins.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="cabin"
                value={c.value}
                checked={selectedCabin === c.value}
                onChange={() => onCabinChange(c.value)}
                className="accent-[#f5c800]"
              />
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-export for use in page
export type { FlightCardProps };
