"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Airport } from "@/types/flight";

interface AirportAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  airports: Airport[];
  placeholder: string;
  className?: string;
}

export function AirportAutocomplete({
  id,
  value,
  onChange,
  airports,
  placeholder,
  className = "",
}: AirportAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedAirport = useMemo(
    () => airports.find((a) => a.airport_code === value),
    [airports, value]
  );

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

  const filteredAirports = useMemo(() => {
    if (!searchTerm) return airports.slice(0, 50);
    const lowerSearch = searchTerm.toLowerCase();
    return airports
      .filter(
        (a) =>
          (a.city?.toLowerCase() || "").includes(lowerSearch) ||
          (a.name?.toLowerCase() || "").includes(lowerSearch) ||
          (a.airport_code?.toLowerCase() || "").includes(lowerSearch) ||
          (a.country?.toLowerCase() || "").includes(lowerSearch)
      )
      .slice(0, 50);
  }, [airports, searchTerm]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

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
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filteredAirports.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredAirports[activeIndex]) {
          handleSelect(filteredAirports[activeIndex]);
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

  return (
    <div className="relative w-full" ref={wrapperRef}>
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
        />

        {/* Clear button — only shown when a value is selected */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="ล้างการเลือก"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-150 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2 2l8 8M10 2l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
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

      {/* Dropdown listbox */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-auto">
          {filteredAirports.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              ไม่พบสนามบินที่ค้นหา
            </div>
          ) : (
            <ul
              role="listbox"
              id={`${id}-listbox`}
              ref={listRef}
              className="py-1"
            >
              {filteredAirports.map((airport, idx) => (
                <li
                  key={airport.airport_code}
                  id={`${id}-option-${idx}`}
                  role="option"
                  aria-selected={airport.airport_code === value}
                  onClick={() => handleSelect(airport)}
                  className={`px-4 py-2.5 cursor-pointer transition-colors duration-100 flex flex-col ${
                    idx === activeIndex
                      ? "bg-[#f5c800]/20"
                      : "hover:bg-[#f5c800]/10"
                  } ${airport.airport_code === value ? "bg-[#f5c800]/10" : ""}`}
                >
                  <span className="text-gray-900 font-semibold text-sm leading-tight">
                    {airport.city}{" "}
                    <span className="text-[#c9a200] font-bold">
                      ({airport.airport_code})
                    </span>
                  </span>
                  <span className="text-gray-500 text-xs mt-0.5 truncate">
                    {airport.name}&nbsp;·&nbsp;{airport.country}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
