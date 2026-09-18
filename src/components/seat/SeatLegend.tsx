"use client";

import React from "react";

export function SeatLegend() {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mt-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Cabin &amp; Seat Legend
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 text-xs">
        {/* Available */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white border border-slate-300 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-1.5 h-3 bg-slate-200 rounded-r-xs ml-auto" />
          </div>
          <span className="text-slate-700 font-medium">Available</span>
        </div>

        {/* Selected */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#f5c800] border border-[#d9af00] shadow-sm flex items-center justify-center shrink-0">
            <div className="w-1.5 h-3 bg-[#d9af00] rounded-r-xs ml-auto" />
          </div>
          <span className="text-slate-800 font-semibold">Selected</span>
        </div>

        {/* Occupied */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 opacity-80">
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-slate-500 font-medium">Occupied</span>
        </div>

        {/* Premium */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-300 shadow-sm flex items-center justify-center shrink-0 relative">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute top-1 left-1" />
            <div className="w-1.5 h-3 bg-amber-300 rounded-r-xs ml-auto" />
          </div>
          <span className="text-slate-700 font-medium">Premium</span>
        </div>

        {/* Exit Row */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-sky-50 border border-sky-300 shadow-sm flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-sky-700">EX</span>
          </div>
          <span className="text-slate-700 font-medium">Exit Row</span>
        </div>

        {/* Window */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="5" y="4" width="14" height="16" rx="7" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-slate-600 font-medium">Window</span>
        </div>

        {/* Middle */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8M8 17h8" />
            </svg>
          </div>
          <span className="text-slate-600 font-medium">Middle</span>
        </div>

        {/* Aisle */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <span className="text-slate-600 font-medium">Aisle</span>
        </div>

        {/* Restroom */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
            <span className="text-[9px] font-bold">WC</span>
          </div>
          <span className="text-slate-600 font-medium">Restroom</span>
        </div>

        {/* Galley */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-slate-600 font-medium">Galley</span>
        </div>
      </div>
    </div>
  );
}
