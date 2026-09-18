"use client";

import React, {
  ReactNode,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AircraftShellProps {
  children: ReactNode;
}

export function AircraftShell({ children }: AircraftShellProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = viewportRef.current?.scrollLeft || 0;
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDownRef.current || !viewportRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 4) {
        hasDraggedRef.current = true;
      }
      viewportRef.current.scrollLeft = scrollLeftRef.current - dx;
    };

    const handleMouseUp = () => {
      if (!isDownRef.current) return;
      isDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 60);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return (
    <div className="relative w-full my-auto flex items-center justify-center py-10 select-none">
      {/* ======================================================
          SWEPT WINGS (Behind the Fuselage)
          Matches the iconic swept wings from the Design Reference
         ====================================================== */}
      {/* Top Swept Wing */}
      <svg
        className="absolute -top-12 sm:-top-16 left-[32%] w-[260px] sm:w-[360px] h-[90px] sm:h-[120px] -z-10 pointer-events-none opacity-85"
        viewBox="0 0 360 120"
        fill="none"
      >
        <path
          d="M 10 120 L 230 10 C 250 0, 275 0, 285 10 L 350 120 Z"
          fill="url(#wingGradientTop)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="wingGradientTop" x1="0" y1="1" x2="0.6" y2="0">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom Swept Wing */}
      <svg
        className="absolute -bottom-12 sm:-bottom-16 left-[32%] w-[260px] sm:w-[360px] h-[90px] sm:h-[120px] -z-10 pointer-events-none opacity-85"
        viewBox="0 0 360 120"
        fill="none"
      >
        <path
          d="M 10 0 L 230 110 C 250 120, 275 120, 285 110 L 350 0 Z"
          fill="url(#wingGradientBottom)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="wingGradientBottom" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* ======================================================
          COHERENT AIRCRAFT SILHOUETTE (NO NESTED CARDS)
          Single continuous aerodynamic hull: Nose -> Cabin -> Tail
         ====================================================== */}
      <div className="relative flex flex-row items-stretch w-full bg-white border-2 border-slate-300/90 rounded-l-[180px] rounded-r-[110px] shadow-[0_20px_50px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* 1. NOSE & COCKPIT SECTION (LEFT) */}
        <div className="w-24 sm:w-32 md:w-40 shrink-0 relative flex flex-col justify-between py-6 bg-gradient-to-r from-slate-100/70 via-slate-50/40 to-white select-none border-r border-slate-100">
          {/* Top Forward Door (Door 1L) */}
          <div className="absolute top-2 left-16 sm:left-24 flex items-center gap-1 opacity-50">
            <div className="w-4 h-1.5 bg-slate-400 rounded-xs" />
            <span className="text-[8px] font-bold text-slate-400">1L</span>
          </div>

          {/* Cockpit Window Array (curved like reference design) */}
          <div className="my-auto ml-2.5 sm:ml-4 flex flex-col gap-1 opacity-90">
            <div className="w-5 sm:w-7 h-4 bg-gradient-to-tr from-sky-700 via-sky-500 to-sky-200 rounded-tl-full rounded-tr-xs border border-sky-600 shadow-xs" />
            <div className="w-7 sm:w-10 h-6 bg-gradient-to-r from-sky-700 via-sky-500 to-sky-100 rounded-l-md border border-sky-600 shadow-xs flex items-center justify-center">
              <div className="w-1 h-3 bg-white/40 rounded-full rotate-12" />
            </div>
            <div className="w-5 sm:w-7 h-4 bg-gradient-to-br from-sky-700 via-sky-500 to-sky-200 rounded-bl-full rounded-br-xs border border-sky-600 shadow-xs" />
          </div>

          {/* Forward Service Area: WC & Galley Bulkhead */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 text-slate-400">
            <div
              title="Forward Lavatory"
              className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500"
            >
              WC
            </div>
            <div
              title="Forward Galley"
              className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* Bottom Forward Door (Door 1R) */}
          <div className="absolute bottom-2 left-16 sm:left-24 flex items-center gap-1 opacity-50">
            <span className="text-[8px] font-bold text-slate-400">1R</span>
            <div className="w-4 h-1.5 bg-slate-400 rounded-xs" />
          </div>
        </div>

        {/* 2. CABIN AREA (CENTER)
            Occupies the fuselage naturally with generous breathing room.
            No rectangular nested borders. Seamless drag-to-scroll viewport. */}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onClickCapture={handleClickCapture}
          className={`flex-1 min-w-0 overflow-x-auto custom-scrollbar px-4 sm:px-6 py-8 relative select-none flex items-center ${
            isDragging ? "cursor-grabbing active-drag" : "cursor-grab"
          }`}
        >
          {children}
        </div>

        {/* 3. TAIL SECTION (RIGHT) */}
        <div className="w-20 sm:w-28 md:w-32 shrink-0 relative flex flex-col justify-between py-6 bg-gradient-to-l from-slate-100/70 via-slate-50/40 to-white select-none border-l border-slate-100">
          {/* Top Aft Door (Door 2L) */}
          <div className="absolute top-2 right-12 sm:right-16 flex items-center gap-1 opacity-50">
            <span className="text-[8px] font-bold text-slate-400">2L</span>
            <div className="w-4 h-1.5 bg-slate-400 rounded-xs" />
          </div>

          {/* Rear Service Area: WC & Galley Bulkhead */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 text-slate-400">
            <div
              title="Aft Lavatory"
              className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500"
            >
              WC
            </div>
            <div
              title="Aft Galley"
              className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* APU Cone / Stabilizers Detail */}
          <div className="my-auto mr-2 sm:mr-4 flex flex-col items-end opacity-40">
            <div className="w-3 h-5 border-r-2 border-t-2 border-slate-400 rounded-tr-md" />
            <div className="w-2 h-2.5 bg-slate-400 rounded-r-full" />
            <div className="w-3 h-5 border-r-2 border-b-2 border-slate-400 rounded-br-md" />
          </div>

          {/* Bottom Aft Door (Door 2R) */}
          <div className="absolute bottom-2 right-12 sm:right-16 flex items-center gap-1 opacity-50">
            <span className="text-[8px] font-bold text-slate-400">2R</span>
            <div className="w-4 h-1.5 bg-slate-400 rounded-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
