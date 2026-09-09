"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { FlightSearchForm } from "@/components/flight/FlightSearchForm";
import { useTranslation } from "@/hooks/useTranslation";
import "./page.css";

/* ─── Static Data ────────────────────────────────────────────── */

const POPULAR_DESTINATIONS = [
  { city: "Paris, France",   price: "$359", emoji: "🗼" },
  { city: "Tokyo, Japan",    price: "$759", emoji: "⛩️" },
  { city: "Dubai, UAE",      price: "$249", emoji: "🏙️" },
  { city: "New York, USA",   price: "$529", emoji: "🗽" },
  { city: "Singapore",       price: "$189", emoji: "🌆" },
  { city: "London, UK",      price: "$429", emoji: "🎡" },
];

const WHY_FLY_FEATURES = [
  { icon: "💸", key: "noHiddenFees"   as const },
  { icon: "⚡", key: "instantConfirm" as const },
  { icon: "🗺️", key: "flexibleRoutes" as const },
  { icon: "🛟", key: "support247"     as const },
];

const OFFERS = [
  {
    id: "offer-1",
    from: "Bangkok",
    to: "Tokyo",
    flag: "🇯🇵",
    discount: "30% OFF",
    price: "$529",
    originalPrice: "$759",
    validUntil: "Sep 30",
    gradient: "from-blue-900 to-indigo-900",
  },
  {
    id: "offer-2",
    from: "Bangkok",
    to: "Dubai",
    flag: "🇦🇪",
    discount: "20% OFF",
    price: "$199",
    originalPrice: "$249",
    validUntil: "Oct 15",
    gradient: "from-amber-900 to-orange-900",
  },
  {
    id: "offer-3",
    from: "Bangkok",
    to: "London",
    flag: "🇬🇧",
    discount: "15% OFF",
    price: "$365",
    originalPrice: "$429",
    validUntil: "Oct 31",
    gradient: "from-emerald-900 to-teal-900",
  },
];

const INSPIRATION = [
  {
    id: "ins-1",
    city: "Santorini",
    country: "Greece",
    emoji: "🏝️",
    color: "#1e3a5f",
    h: "row-span-2",
  },
  {
    id: "ins-2",
    city: "Kyoto",
    country: "Japan",
    emoji: "⛩️",
    color: "#2d1b4e",
    h: "",
  },
  {
    id: "ins-3",
    city: "Marrakech",
    country: "Morocco",
    emoji: "🕌",
    color: "#4a2010",
    h: "",
  },
  {
    id: "ins-4",
    city: "Patagonia",
    country: "Argentina",
    emoji: "🏔️",
    color: "#0d3b2e",
    h: "",
  },
  {
    id: "ins-5",
    city: "Maldives",
    country: "Maldives",
    emoji: "🌊",
    color: "#0c2a4a",
    h: "",
  },
];

/* ─── Page ───────────────────────────────────────────────────── */

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <Header variant="transparent" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home-hero flex flex-col items-center justify-center px-4 pt-20 pb-16">
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none home-noise-overlay" />

        {/* Search card */}
        <div className="relative w-full max-w-3xl rounded-3xl px-8 py-10 home-hero-card">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {t.home.hero}
              <br />
              <span className="text-white">X-Fly Anyway.</span>
            </h1>
          </div>
          <FlightSearchForm />
        </div>

        {/* Popular destination strip */}
        <div className="relative mt-8 w-full max-w-3xl">
          <div className="rounded-2xl px-6 py-4 home-destinations-strip">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
              {t.home.popularDestinations}
            </p>
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
              {POPULAR_DESTINATIONS.map((dest) => (
                <div
                  key={dest.city}
                  className="flex items-center gap-3 min-w-max group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl group-hover:bg-white/20 transition-colors">
                    {dest.emoji}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{dest.city}</p>
                    <p className="text-[#f5c800] text-xs font-semibold">{dest.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Fly With X-Fly ───────────────────────────────── */}
      <section className="home-section home-why-fly" id="why-fly">
        <div className="home-section-inner">
          <span className="home-section-label">X-Fly Anyway</span>
          <h2 className="home-section-title">{t.home.whyFly.title}</h2>
          <p className="home-section-subtitle mb-12">{t.home.whyFly.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_FLY_FEATURES.map(({ icon, key }) => (
              <div key={key} className="why-fly-card">
                <div className="why-fly-icon">{icon}</div>
                <h3>{t.home.whyFly[key]}</h3>
                <p>{t.home.whyFly[`${key}Desc` as keyof typeof t.home.whyFly]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Special Offers ───────────────────────────────────── */}
      <section className="home-section home-offers" id="offers">
        <div className="home-section-inner">
          <span className="home-section-label">Promotions</span>
          <h2 className="home-section-title">{t.home.offers.title}</h2>
          <p className="home-section-subtitle mb-12">{t.home.offers.subtitle}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map((offer) => (
              <div key={offer.id} className="offer-card">
                {/* Card header */}
                <div className={`bg-gradient-to-br ${offer.gradient} p-6 flex items-center justify-between`}>
                  <div>
                    <div className="offer-badge mb-3">{t.home.offers.badge} · {offer.discount}</div>
                    <p className="text-white/60 text-xs font-medium mb-0.5">{offer.from} → {offer.to}</p>
                    <div className="offer-price text-white">
                      {offer.price}{" "}
                      <span className="line-through">{offer.originalPrice}</span>
                    </div>
                  </div>
                  <span className="text-5xl" role="img" aria-label={offer.to}>{offer.flag}</span>
                </div>
                {/* Card footer */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-4">Valid until {offer.validUntil}</p>
                  <Link href="/" className="offer-book-btn">
                    {t.home.offers.bookNow}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel Inspiration ───────────────────────────────── */}
      <section className="home-section home-inspiration" id="inspiration">
        <div className="home-section-inner">
          <span className="home-section-label">Explore</span>
          <h2 className="home-section-title">{t.home.inspiration.title}</h2>
          <p className="home-section-subtitle mb-12">{t.home.inspiration.subtitle}</p>

          {/* Masonry-ish grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ gridAutoRows: "200px" }}>
            {INSPIRATION.map((dest, i) => (
              <div
                key={dest.id}
                className={`inspiration-card ${i === 0 ? "row-span-2" : ""}`}
                style={{ background: dest.color }}
              >
                {/* Emoji background */}
                <div className="absolute inset-0 flex items-center justify-center text-[8rem] opacity-25 select-none pointer-events-none">
                  {dest.emoji}
                </div>
                <div className="inspiration-overlay">
                  <p className="inspiration-card-title">{dest.city}</p>
                  <p className="inspiration-card-sub">{dest.country}</p>
                  <span className="inspiration-explore-btn">
                    {t.home.inspiration.explore} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="home-footer" role="contentinfo">
        <div className="home-footer-inner">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-0">
            {/* Brand */}
            <div>
              <p className="font-bold text-white text-lg tracking-tight">X-Fly Anyway ✈️</p>
              <p className="home-footer-logo-tagline mt-1">{t.home.footer.tagline}</p>
            </div>

            {/* Company */}
            <div>
              <p className="home-footer-col-title">{t.home.footer.company}</p>
              <a href="#" className="home-footer-link">{t.home.footer.about}</a>
              <a href="#" className="home-footer-link">{t.home.footer.careers}</a>
              <a href="#" className="home-footer-link">{t.home.footer.press}</a>
            </div>

            {/* Support */}
            <div>
              <p className="home-footer-col-title">{t.home.footer.support}</p>
              <a href="#" className="home-footer-link">{t.home.footer.helpCenter}</a>
              <a href="#" className="home-footer-link">{t.home.footer.cancellation}</a>
              <a href="#" className="home-footer-link">{t.home.footer.baggage}</a>
            </div>

            {/* Legal */}
            <div>
              <p className="home-footer-col-title">{t.home.footer.legal}</p>
              <a href="#" className="home-footer-link">{t.home.footer.privacy}</a>
              <a href="#" className="home-footer-link">{t.home.footer.terms}</a>
            </div>
          </div>

          <hr className="home-footer-divider" />
          <p className="home-footer-copyright">
            © {new Date().getFullYear()} X-Fly Anyway. {t.home.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
