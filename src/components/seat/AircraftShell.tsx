"use client";

import { ReactNode } from "react";

interface AircraftShellProps {
  children: ReactNode;
}

export function AircraftShell({ children }: AircraftShellProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-12 px-6 overflow-hidden select-none">
      {/* Aircraft Nose */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white rounded-t-full border-t border-l border-r border-[#e5e7eb] shadow-sm z-0" style={{ transform: "translate(-50%, 0) perspective(400px) rotateX(10deg)" }}>
        {/* Cockpit Windows */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
           <div className="w-8 h-4 bg-gray-200/50 rounded-tl-full rounded-bl-sm transform -rotate-12"></div>
           <div className="w-8 h-4 bg-gray-200/50 rounded-tr-full rounded-br-sm transform rotate-12"></div>
        </div>
      </div>

      {/* Aircraft Body */}
      <div className="relative z-10 bg-white border border-[#e5e7eb] shadow-xl rounded-[40px] px-4 md:px-8 py-10 min-h-[500px]">
        {children}
      </div>

      {/* Wing Indications */}
      <div className="absolute top-[40%] left-0 w-8 h-48 bg-gradient-to-l from-white to-gray-50 border border-r-0 border-[#e5e7eb] rounded-l-full -z-10 shadow-sm opacity-50 transform -skew-y-12"></div>
      <div className="absolute top-[40%] right-0 w-8 h-48 bg-gradient-to-r from-white to-gray-50 border border-l-0 border-[#e5e7eb] rounded-r-full -z-10 shadow-sm opacity-50 transform skew-y-12"></div>
    </div>
  );
}
