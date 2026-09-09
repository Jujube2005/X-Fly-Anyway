"use client";

import { Header } from "@/components/layout/Header";
import { FlightSearchForm } from "@/components/flight/FlightSearchForm";
import { useTranslation } from "@/hooks/useTranslation";
import "./page.css";



const POPULAR_DESTINATIONS = [
  { city: "Paris, France", price: "$359", emoji: "🗼" },
  { city: "Tokyo, Japan", price: "$759", emoji: "⛩️" },
  { city: "Dubai, UAE", price: "$249", emoji: "🏙️" },
];

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden home-container">
      {/* Noise/texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none home-noise-overlay" />

      <Header variant="transparent" />

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-8">
        {/* Glass search card */}
        <div className="w-full max-w-3xl rounded-3xl px-8 py-10 home-hero-card">
          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {t.home.hero}
              <br />
              <span className="text-white">X-Fly Anyway.</span>
            </h1>
          </div>

          <FlightSearchForm />
        </div>

        {/* Popular destinations */}
        <div className="mt-8 w-full max-w-3xl">
          <div className="rounded-2xl px-6 py-4 home-destinations-card">
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
