"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { FlightSearchForm } from "@/components/flight/FlightSearchForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCurrency } from "@/lib/utils/currency";
import "./page.css";

/* ─── SVG Icons ──────────────────────────────────────────────── */

function IconNoFees() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRoute() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="6" r="2" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="19" cy="18" r="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 6h5a4 4 0 0 1 4 4v2a4 4 0 0 0 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function IconHeadset() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14v-3a8 8 0 1 1 16 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="2" y="14" width="4" height="6" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="18" y="14" width="4" height="6" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

function IconPlane() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 4.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Static Data ────────────────────────────────────────────── */

// clickable=true means the IATA code exists in the seeded airport database.
// CDG, TYO, JFK are NOT seeded — display only, not clickable.
const POPULAR_DESTINATIONS = [
  { city: "Paris, France",   price: 12500, iata: "CDG", clickable: false },
  { city: "Tokyo, Japan",    price: 26500, iata: "NRT", clickable: true  },
  { city: "Dubai, UAE",      price: 8700,  iata: "DXB", clickable: true  },
  { city: "New York, USA",   price: 18500, iata: "JFK", clickable: false },
  { city: "Singapore",       price: 6600,  iata: "SIN", clickable: true  },
  { city: "London, UK",      price: 15000, iata: "LHR", clickable: true  },
];

const WHY_FLY_FEATURES = [
  { Icon: IconNoFees,  key: "noHiddenFees"   as const },
  { Icon: IconBolt,    key: "instantConfirm" as const },
  { Icon: IconRoute,   key: "flexibleRoutes" as const },
  { Icon: IconHeadset, key: "support247"     as const },
];

// Featured Routes — real routes, no fake prices or discounts
const FEATURED_ROUTES = [
  {
    id: "route-1",
    from: "Bangkok",
    fromCode: "BKK",
    to: "Tokyo",
    toCode: "NRT",
    description: "Land of the rising sun",
    accent: "#1e40af",
    accentLight: "#3b82f6",
  },
  {
    id: "route-2",
    from: "Bangkok",
    fromCode: "BKK",
    to: "Dubai",
    toCode: "DXB",
    description: "Desert city of wonders",
    accent: "#b45309",
    accentLight: "#f59e0b",
  },
  {
    id: "route-3",
    from: "Bangkok",
    fromCode: "BKK",
    to: "London",
    toCode: "LHR",
    description: "Heart of the British Isles",
    accent: "#065f46",
    accentLight: "#10b981",
  },
];

// Unsplash photo IDs — free-to-use, no download needed
const INSPIRATION = [
  { id: "ins-1", city: "Santorini",  country: "Greece",    unsplashId: "photo-1570077188670-e3a8d69ac5ff", span2: true  },
  { id: "ins-2", city: "Kyoto",      country: "Japan",     unsplashId: "photo-1493976040374-85c8e12f0c0e", span2: false },
  { id: "ins-3", city: "Marrakech",  country: "Morocco",   unsplashId: "photo-1539020140153-e479b8c22e70", span2: false },
  { id: "ins-4", city: "Patagonia",  country: "Argentina", unsplashId: "photo-1501854140801-50d01698950b", span2: false },
  { id: "ins-5", city: "Maldives",   country: "Maldives",  unsplashId: "photo-1514282401047-d79a71a590e8", span2: false },
];

// IATA codes for inspiration cards that have seeded airport data
const INSPIRATION_IATA: Record<string, string> = {
  Tokyo: "NRT",
  Dubai: "DXB",
  London: "LHR",
  // Santorini, Kyoto, Marrakech, Patagonia, Maldives have no seeded airports
};

/* ─── Page ───────────────────────────────────────────────────── */

function HomeContent() {
  const { t } = useTranslation();
  const { language, currency } = useLocale();
  const searchParams = useSearchParams();
  const heroRef = useRef<HTMLDivElement>(null);

  // Read ?destination= query param on mount and whenever it changes.
  // This is the same mechanism used by Popular Destinations (setHeroDestination).
  const queryDestination = searchParams.get("destination") ?? undefined;

  // Popular destination click-to-fill: stores the IATA code to set as destination.
  // Only airports that exist in the seed DB are clickable.
  const [heroDestination, setHeroDestination] = useState<string | undefined>(queryDestination);

  // Sync state when query param changes (e.g. navigating from Offers/Inspiration)
  useEffect(() => {
    if (queryDestination) {
      setHeroDestination(queryDestination);
      // Scroll to hero search form so user sees the pre-filled destination
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [queryDestination]);

  function handleDestinationClick(iata: string) {
    setHeroDestination(iata);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col">
      <Header variant="transparent" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="home-hero flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none home-noise-overlay" />

        <div className="relative w-full max-w-3xl rounded-3xl px-8 py-10 home-hero-card">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {t.home.hero}
              <br />
              <span className="text-white">X-Fly Anyway.</span>
            </h1>
          </div>
          <FlightSearchForm defaultDestination={heroDestination} />
        </div>

        {/* Popular destinations strip */}
        <div className="relative mt-8 w-full max-w-3xl">
          <div className="rounded-2xl px-6 py-4 home-destinations-strip">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
              {t.home.popularDestinations}
            </p>
            <div className="flex items-center gap-5 overflow-x-auto scrollbar-none">
              {POPULAR_DESTINATIONS.map((dest) => (
                <div
                  key={dest.city}
                  onClick={() => {
                    if (dest.clickable) {
                      handleDestinationClick(dest.iata);
                    }
                  }}
                  title={dest.clickable ? `เลือกปลายทาง ${dest.city}` : undefined}
                  className={`flex items-center gap-3 min-w-max group ${
                    dest.clickable
                      ? "cursor-pointer"
                      : "cursor-default opacity-50"
                  }`}
                >
                  {/* IATA code badge */}
                  <div className={`w-11 h-11 rounded-full bg-white/10 flex items-center justify-center transition-colors shrink-0 ${
                    dest.clickable ? "group-hover:bg-white/20 group-hover:ring-1 group-hover:ring-[#f5c800]/40" : ""
                  }`}>
                    <span className="text-white text-[10px] font-bold tracking-wide leading-none">
                      {dest.iata}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{dest.city}</p>
                    <p className={`text-xs font-semibold ${
                      dest.clickable ? "text-[#f5c800]" : "text-white/40"
                    }`}>
                      {dest.clickable
                        ? formatCurrency(dest.price, currency, language)
                        : "Coming soon"}
                    </p>
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
            {WHY_FLY_FEATURES.map(({ Icon, key }) => (
              <div key={key} className="why-fly-card">
                <div className="why-fly-icon text-[#f5c800]">
                  <Icon />
                </div>
                <h3>{t.home.whyFly[key]}</h3>
                <p>{t.home.whyFly[`${key}Desc` as keyof typeof t.home.whyFly]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Routes ───────────────────────────────────── */}
      <section className="home-section home-offers" id="offers">
        <div className="home-section-inner">
          <span className="home-section-label">Routes</span>
          <h2 className="home-section-title">{t.home.offers.title}</h2>
          <p className="home-section-subtitle mb-12">Popular routes departing from Bangkok</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_ROUTES.map((route) => (
              <div key={route.id} className="offer-card">
                {/* Card header */}
                <div
                  className="p-6 flex items-start justify-between"
                  style={{ background: `linear-gradient(135deg, ${route.accent} 0%, ${route.accentLight}33 100%)` }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white/70 text-xs font-medium">{route.from}</span>
                      <span className="text-white/40"><IconPlane /></span>
                      <span className="text-white font-bold text-sm">{route.to}</span>
                    </div>
                    <p className="text-white/55 text-xs">{route.description}</p>
                  </div>
                  {/* IATA destination code */}
                  <div
                    className="rounded-xl px-3 py-2 flex flex-col items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <span className="text-white text-lg font-black tracking-widest leading-none">{route.toCode}</span>
                    <span className="text-white/50 text-[9px] mt-0.5 tracking-wide">IATA</span>
                  </div>
                </div>
                {/* Card footer */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-4">{route.fromCode} → {route.toCode}</p>
                  <Link href={`/?destination=${route.toCode}`} className="offer-book-btn">
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ gridAutoRows: "200px" }}>
            {INSPIRATION.map((dest, i) => {
              const iata = INSPIRATION_IATA[dest.city];
              const isClickable = Boolean(iata);
              const imgSrc = `https://images.unsplash.com/${dest.unsplashId}?auto=format&fit=crop&w=600&q=70`;
              return (
                <div
                  key={dest.id}
                  className={`inspiration-card ${i === 0 ? "row-span-2" : ""} ${isClickable ? "cursor-pointer" : ""}`}
                  onClick={() => isClickable && handleDestinationClick(iata!)}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") handleDestinationClick(iata!); } : undefined}
                  aria-label={isClickable ? `Explore ${dest.city} — pre-fill destination` : undefined}
                >
                  {/* Unsplash background image */}
                  <Image
                    src={imgSrc}
                    alt={`${dest.city}, ${dest.country}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="inspiration-card-bg"
                    style={{ objectFit: "cover" }}
                  />
                  {/* MapPin icon top-right */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white z-10">
                    <IconMapPin />
                  </div>
                  <div className="inspiration-overlay z-10">
                    <p className="inspiration-card-title">{dest.city}</p>
                    <p className="inspiration-card-sub">{dest.country}</p>
                    <span className={`inspiration-explore-btn ${isClickable ? "text-[#f5c800]" : "text-white/50 cursor-default"}`}>
                      {isClickable ? t.home.inspiration.explore : "Coming soon"}
                      {isClickable && <IconArrowRight />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="home-footer" role="contentinfo">
        <div className="home-footer-inner">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
                <IconPlane />
                X-Fly Anyway
              </div>
              <p className="home-footer-logo-tagline mt-2">{t.home.footer.tagline}</p>
            </div>

            {/* Company */}
            <div>
              <p className="home-footer-col-title">{t.home.footer.company}</p>
              <span className="home-footer-link block cursor-default">{t.home.footer.about}</span>
              <span className="home-footer-link block cursor-default">{t.home.footer.careers}</span>
              <span className="home-footer-link block cursor-default">{t.home.footer.press}</span>
            </div>

            {/* Support */}
            <div>
              <p className="home-footer-col-title">{t.home.footer.support}</p>
              <span className="home-footer-link block cursor-default">{t.home.footer.helpCenter}</span>
              <span className="home-footer-link block cursor-default">{t.home.footer.cancellation}</span>
              <span className="home-footer-link block cursor-default">{t.home.footer.baggage}</span>
            </div>

            {/* Legal */}
            <div>
              <p className="home-footer-col-title">{t.home.footer.legal}</p>
              <span className="home-footer-link block cursor-default">{t.home.footer.privacy}</span>
              <span className="home-footer-link block cursor-default">{t.home.footer.terms}</span>
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

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
