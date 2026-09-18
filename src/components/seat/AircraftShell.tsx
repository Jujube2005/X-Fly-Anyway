"use client";

import React, { ReactNode } from "react";

interface AircraftShellProps {
  children: ReactNode;
}

export function AircraftShell({ children }: AircraftShellProps) {
  return (
    <div className="w-full bg-slate-100/70 rounded-3xl p-3 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Complete Horizontal Aircraft Structure */}
      <div className="relative flex flex-row items-stretch w-full">
        {/* ======================================================
            1. NOSE SECTION (LEFT)
            Aerodynamic cockpit cone, cockpit glass, forward doors, galley/lav
           ====================================================== */}
        <div className="w-24 sm:w-32 md:w-36 shrink-0 bg-gradient-to-r from-slate-200 via-slate-100 to-white border-y-2 border-l-2 border-slate-300 rounded-l-[120px] shadow-[inset_12px_0_24px_rgba(0,0,0,0.06)] relative flex flex-col justify-between py-4 select-none z-10">
          {/* Top Forward Door (Door 1L) */}
          <div className="absolute -top-1 left-16 sm:left-20 flex flex-col items-center">
            <div className="w-5 h-2 bg-slate-400 rounded-xs border border-slate-500 shadow-xs" />
            <span className="text-[8px] font-bold text-slate-400 mt-0.5">1L</span>
          </div>

          {/* Cockpit Window Array */}
          <div className="my-auto ml-2 sm:ml-4 flex flex-col gap-1.5 opacity-85">
            <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gradient-to-tr from-sky-600 via-sky-400 to-sky-200 rounded-tl-full rounded-tr-xs border border-sky-600 shadow-xs" />
            <div className="w-8 sm:w-11 h-6 sm:h-7 bg-gradient-to-r from-sky-600 via-sky-400 to-sky-100 rounded-l-md border border-sky-600 shadow-xs flex items-center justify-center">
              <div className="w-1 h-3 bg-white/40 rounded-full rotate-12" />
            </div>
            <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gradient-to-br from-sky-600 via-sky-400 to-sky-200 rounded-bl-full rounded-br-xs border border-sky-600 shadow-xs" />
          </div>

          {/* Forward Service Area: Galley & Lavatory */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-slate-400 border-r border-slate-200 pr-2">
            <div
              title="Forward Lavatory"
              className="w-5 h-5 rounded-md bg-slate-200/80 border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-600"
            >
              WC
            </div>
            <div
              title="Forward Galley"
              className="w-5 h-5 rounded-md bg-slate-200/80 border border-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-600"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* Bottom Forward Door (Door 1R) */}
          <div className="absolute -bottom-1 left-16 sm:left-20 flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 mb-0.5">1R</span>
            <div className="w-5 h-2 bg-slate-400 rounded-xs border border-slate-500 shadow-xs" />
          </div>
        </div>

        {/* ======================================================
            2. MAIN FUSELAGE & CABIN VIEWPORT (CENTER)
            Contains the CabinViewport, fuselage hull lines, and windows
           ====================================================== */}
        <div className="flex-1 min-w-0 bg-white border-y-2 border-slate-300 relative flex flex-col justify-center shadow-[inset_0_12px_20px_-10px_rgba(0,0,0,0.04),inset_0_-12px_20px_-10px_rgba(0,0,0,0.04)]">
          {/* Top Fuselage Hull Details (Windows & Overwing Exits) */}
          <div className="h-6 w-full flex items-center justify-between px-6 border-b border-slate-100 bg-gradient-to-b from-slate-100/90 to-white select-none">
            {/* Top decorative passenger windows */}
            <div className="flex items-center gap-3 overflow-hidden opacity-30">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={`win-top-${i}`} className="w-2 h-3 rounded-full bg-slate-400 shrink-0" />
              ))}
            </div>

            {/* Overwing Exit Door Marker */}
            <div className="flex items-center gap-1 bg-sky-50 border border-sky-300 rounded px-1.5 py-0.5 text-[8px] font-extrabold text-sky-700 shadow-2xs">
              <span>EXIT L</span>
            </div>
          </div>

          {/* Cabin Viewport: dedicated scrollable interior */}
          <div className="w-full overflow-x-auto custom-scrollbar px-3 sm:px-6 py-4 relative bg-slate-50/40">
            {children}
          </div>

          {/* Bottom Fuselage Hull Details (Windows & Overwing Exits) */}
          <div className="h-6 w-full flex items-center justify-between px-6 border-t border-slate-100 bg-gradient-to-t from-slate-100/90 to-white select-none">
            {/* Bottom decorative passenger windows */}
            <div className="flex items-center gap-3 overflow-hidden opacity-30">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={`win-bot-${i}`} className="w-2 h-3 rounded-full bg-slate-400 shrink-0" />
              ))}
            </div>

            {/* Overwing Exit Door Marker */}
            <div className="flex items-center gap-1 bg-sky-50 border border-sky-300 rounded px-1.5 py-0.5 text-[8px] font-extrabold text-sky-700 shadow-2xs">
              <span>EXIT R</span>
            </div>
          </div>
        </div>

        {/* ======================================================
            3. TAIL SECTION (RIGHT)
            Tapered aft fuselage, rear doors, rear galley/lav, stabilizers & APU
           ====================================================== */}
        <div className="w-24 sm:w-32 md:w-36 shrink-0 bg-gradient-to-l from-slate-200 via-slate-100 to-white border-y-2 border-r-2 border-slate-300 rounded-r-[90px] shadow-[inset_-12px_0_24px_rgba(0,0,0,0.06)] relative flex flex-col justify-between py-4 select-none z-10">
          {/* Top Aft Door (Door 2L) */}
          <div className="absolute -top-1 right-16 sm:right-20 flex flex-col items-center">
            <div className="w-5 h-2 bg-slate-400 rounded-xs border border-slate-500 shadow-xs" />
            <span className="text-[8px] font-bold text-slate-400 mt-0.5">2L</span>
          </div>

          {/* Rear Service Area: Galley & Lavatory */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-slate-400 border-l border-slate-200 pl-2">
            <div
              title="Aft Lavatory"
              className="w-5 h-5 rounded-md bg-slate-200/80 border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-600"
            >
              WC
            </div>
            <div
              title="Aft Galley"
              className="w-5 h-5 rounded-md bg-slate-200/80 border border-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-600"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* APU Cone / Vertical Stabilizer Detail */}
          <div className="my-auto mr-3 sm:mr-5 flex flex-col items-end opacity-60">
            <div className="w-4 h-6 sm:w-6 sm:h-8 border-r-2 border-t-2 border-slate-400 rounded-tr-xl bg-slate-300/50" />
            <div className="w-2 h-3 bg-slate-500 rounded-r-full shadow-xs" />
            <div className="w-4 h-6 sm:w-6 sm:h-8 border-r-2 border-b-2 border-slate-400 rounded-br-xl bg-slate-300/50" />
          </div>

          {/* Bottom Aft Door (Door 2R) */}
          <div className="absolute -bottom-1 right-16 sm:right-20 flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 mb-0.5">2R</span>
            <div className="w-5 h-2 bg-slate-400 rounded-xs border border-slate-500 shadow-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
