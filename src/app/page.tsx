import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { FlightSearchForm } from "@/components/flight/FlightSearchForm";

export const metadata: Metadata = {
  title: "X-Fly Anyway — Book Flights, Fly Anywhere",
  description:
    "Search and book flights instantly — no login needed. Just pick your route and go.",
};

const POPULAR_DESTINATIONS = [
  { city: "Paris, France", price: "$359", emoji: "🗼" },
  { city: "Tokyo, Japan", price: "$759", emoji: "⛩️" },
  { city: "Dubai, UAE", price: "$249", emoji: "🏙️" },
];

export default function HomePage() {
  return (
    <div
      className="relative min-h-dvh flex flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, #6b21a8 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #1e40af 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #c2410c 0%, transparent 50%), #0f172a",
      }}
    >
      {/* Noise/texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Header variant="transparent" />

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-8">
        {/* Glass search card */}
        <div
          className="w-full max-w-3xl rounded-3xl px-8 py-10"
          style={{
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 48px 0 rgba(0,0,0,0.24)",
          }}
        >
          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Your Journey Begins Here.
              <br />
              <span className="text-white">X-Fly Anyway.</span>
            </h1>
          </div>

          <FlightSearchForm />
        </div>

        {/* Popular destinations */}
        <div className="mt-8 w-full max-w-3xl">
          <div
            className="rounded-2xl px-6 py-4"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
              {POPULAR_DESTINATIONS.map((dest) => (
                <div
                  key={dest.city}
                  className="flex items-center gap-3 min-w-max group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl group-hover:bg-white/20 transition-colors">
                    {dest.emoji}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">
                      {dest.city}
                    </p>
                    <p className="text-[#f5c800] text-xs font-semibold">
                      {dest.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
