"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Airport } from "@/types/flight";
import { useTranslation } from "@/hooks/useTranslation";

interface AirportAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  airports: Airport[];
  placeholder: string;
  className?: string;
  align?: "left" | "right" | "auto";
}

type Region = "Domestic" | "Asia" | "Europe" | "MiddleEast" | "Americas" | "Other";

const REGION_ORDER: Region[] = ["Domestic", "Asia", "Europe", "MiddleEast", "Americas", "Other"];

const REGION_LABELS: Record<Region, { th: string; en: string }> = {
  Domestic: { th: "ในประเทศ (Domestic)", en: "Domestic" },
  Asia: { th: "เอเชีย (Asia)", en: "Asia" },
  Europe: { th: "ยุโรป (Europe)", en: "Europe" },
  MiddleEast: { th: "ตะวันออกกลาง (Middle East)", en: "Middle East" },
  Americas: { th: "อเมริกา (Americas)", en: "Americas" },
  Other: { th: "อื่นๆ (Other)", en: "Other" }
};

function getRegion(airport: Airport): Region {
  if (airport.country_code === "TH") return "Domestic";
  const meCodes = ["AE", "QA", "SA", "OM", "BH", "KW", "IL", "JO", "LB", "TR"];
  if (meCodes.includes(airport.country_code)) return "MiddleEast";
  if (airport.timezone?.startsWith("Asia/")) return "Asia";
  if (airport.timezone?.startsWith("Europe/")) return "Europe";
  if (airport.timezone?.startsWith("America/")) return "Americas";
  return "Other";
}

export function AirportAutocomplete({
  id,
  value,
  onChange,
  airports,
  placeholder,
  className = "",
  align = "auto",
}: AirportAutocompleteProps) {
  const { language } = useTranslation();
  const isTh = language === "th";
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [shiftX, setShiftX] = useState(0);

  const selectedAirport = useMemo(
    () => airports.find((a) => a.airport_code === value),
    [airports, value]
  );

  // Determine alignment direction
  const effectiveAlign = useMemo(() => {
    if (align && align !== "auto") return align;
    if (typeof window !== "undefined" && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      return rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right";
    }
    return "left";
  }, [align, isOpen]);

  // Adjust popover if it would overflow the screen
  useEffect(() => {
    if (!isOpen) {
      setShiftX(0);
      return;
    }

    const checkBounds = () => {
      if (!popoverRef.current) return;
      const rect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 12; // safe distance from viewport edge

      let offset = 0;
      if (rect.left < padding) {
        offset = padding - rect.left;
      } else if (rect.right > viewportWidth - padding) {
        offset = (viewportWidth - padding) - rect.right;
      }

      if (offset !== 0) {
        setShiftX((prev) => prev + offset);
      }
    };

    const frameId = requestAnimationFrame(checkBounds);
    window.addEventListener("resize", checkBounds, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", checkBounds);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedAirports = useMemo(() => {
    let filtered = airports;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = airports.filter(
        (a) =>
          (a.city?.toLowerCase() || "").includes(lowerSearch) ||
          (a.name?.toLowerCase() || "").includes(lowerSearch) ||
          (a.airport_code?.toLowerCase() || "").includes(lowerSearch) ||
          (a.country?.toLowerCase() || "").includes(lowerSearch) ||
          (a.country_code?.toLowerCase() || "").includes(lowerSearch)
      );
    } else {
      // Show default popular airports if no search
      filtered = airports.slice(0, 60);
    }

    return filtered.sort((a, b) => {
      const rA = REGION_ORDER.indexOf(getRegion(a));
      const rB = REGION_ORDER.indexOf(getRegion(b));
      if (rA !== rB) return rA - rB;
      return (a.city || "").localeCompare(b.city || "");
    }).slice(0, 60); // Cap to 60 for performance
  }, [airports, searchTerm]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const el = document.getElementById(`${id}-option-${activeIndex}`);
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex, id]);

  function handleOpen() {
    setSearchTerm("");
    setActiveIndex(-1);
    setIsOpen(true);
  }

  function handleSelect(airport: Airport) {
    onChange(airport.airport_code);
    setSearchTerm("");
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        handleOpen();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, sortedAirports.length - 1));
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && sortedAirports[activeIndex]) {
          handleSelect(sortedAirports[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  const inputDisplayValue = isOpen
    ? searchTerm
    : selectedAirport
    ? `${selectedAirport.city} (${selectedAirport.airport_code})`
    : "";

  let globalIdx = 0;
  const groups: Partial<Record<Region, Airport[]>> = {};
  for (const a of sortedAirports) {
    const r = getRegion(a);
    if (!groups[r]) groups[r] = [];
    groups[r]!.push(a);
  }

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : ""}`} ref={wrapperRef}>
      {/* Input + clear button wrapper */}
      <div className="relative">
        <input
          type="text"
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          value={inputDisplayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setActiveIndex(-1);
            if (!isOpen) setIsOpen(true);
          }}
          onClick={handleOpen}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={value ? `${className} pr-9` : className}
          autoComplete="off"
          required={!value}
          suppressHydrationWarning
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={isTh ? "ล้างการเลือก" : "Clear selection"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-150 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Selected airport name subtitle */}
      {selectedAirport && !isOpen && (
        <p className="text-[11px] text-white/40 mt-0.5 px-1 truncate leading-tight select-none">
          {selectedAirport.name}
        </p>
      )}

      {/* Popover Pill UI */}
      {isOpen && (
        <div 
          ref={popoverRef}
          style={{ transform: shiftX ? `translateX(${shiftX}px)` : undefined }}
          className={`absolute z-50 w-full sm:w-[480px] md:w-[580px] lg:w-[660px] max-w-[calc(100vw-24px)] ${
            effectiveAlign === "right"
              ? "left-0 sm:left-auto sm:right-0"
              : "left-0 sm:left-0 sm:right-auto"
          } mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 max-h-[60vh] flex flex-col overflow-hidden transition-transform duration-100 ease-out`}
          role="dialog"
          aria-label={isTh ? "เมืองหรือสนามบินยอดนิยม" : "Popular Cities & Airports"}
        >
          {/* Header */}
          <div className="bg-slate-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0">
            <span className="font-bold text-gray-800 text-sm">
              {isTh ? "เมืองหรือสนามบินยอดนิยม" : "Popular Cities & Airports"}
            </span>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              aria-label={isTh ? "ปิด" : "Close"}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 custom-scrollbar" role="listbox" id={`${id}-listbox`}>
            {sortedAirports.length === 0 ? (
              <div className="py-8 text-sm text-gray-500 text-center flex flex-col items-center">
                <span className="text-4xl mb-2 opacity-50">🔍</span>
                {isTh ? "ไม่พบสนามบินหรือเมืองที่ค้นหา" : "No matching airports or cities found"}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {REGION_ORDER.map((region) => {
                  const items = groups[region];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={region} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide shrink-0">
                          {isTh ? REGION_LABELS[region].th : REGION_LABELS[region].en}
                        </h4>
                        <div className="h-px bg-gray-100 w-full" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {items.map((airport) => {
                          const idx = globalIdx++;
                          const isActive = activeIndex === idx;
                          const isSelected = airport.airport_code === value;

                          return (
                            <button
                              key={airport.airport_code}
                              id={`${id}-option-${idx}`}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelect(airport)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={`flex flex-col text-left justify-center items-start px-3.5 py-2 rounded-xl border transition-all duration-200 ${
                                isActive || isSelected
                                  ? "border-[#f5c800] bg-[#fdf8e6] shadow-sm scale-[1.02]"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex justify-between items-center w-full gap-2">
                                <span className={`font-semibold text-sm truncate ${isActive || isSelected ? "text-gray-900" : "text-gray-700"}`}>
                                  {airport.city}
                                </span>
                                <span className={`text-xs font-bold shrink-0 ${isActive || isSelected ? "text-[#c9a200]" : "text-gray-400"}`}>
                                  {airport.airport_code}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 truncate w-full mt-0.5" title={airport.name}>
                                {airport.name.replace(/ Airport| International/gi, '')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
