"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ── Types ────────────────────────────────────────────────────── */
export interface LocaleState {
  language: string; // BCP-47 code e.g. "th", "en", "ja"
  currency: string; // ISO-4217 code e.g. "THB", "USD"
}

interface LocaleContextType extends LocaleState {
  setLanguage: (code: string) => void;
  setCurrency: (code: string) => void;
}

/* ── Storage ─────────────────────────────────────────────────── */
const STORAGE_KEY = "xfly_locale";

function loadLocale(): LocaleState {
  if (typeof window === "undefined") return { language: "th", currency: "THB" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { language: "th", currency: "THB" };
  } catch {
    return { language: "th", currency: "THB" };
  }
}

function saveLocale(state: LocaleState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* noop */ }
}

/* ── Context ─────────────────────────────────────────────────── */
const LocaleContext = createContext<LocaleContextType>({
  language: "th",
  currency: "THB",
  setLanguage: () => {},
  setCurrency: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleState>({ language: "th", currency: "THB" });

  // Hydrate from localStorage (client only)
  useEffect(() => {
    setLocale(loadLocale());
  }, []);

  // Sync <html lang="..."> attribute
  useEffect(() => {
    document.documentElement.lang = locale.language;
  }, [locale.language]);

  function setLanguage(code: string) {
    const next = { ...locale, language: code };
    setLocale(next);
    saveLocale(next);
  }

  function setCurrency(code: string) {
    const next = { ...locale, currency: code };
    setLocale(next);
    saveLocale(next);
  }

  return (
    <LocaleContext.Provider value={{ ...locale, setLanguage, setCurrency }}>
      {children}
    </LocaleContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────── */
export function useLocale() {
  return useContext(LocaleContext);
}
