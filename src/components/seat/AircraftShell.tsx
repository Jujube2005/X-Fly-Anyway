"use client";

import { ReactNode } from "react";

interface AircraftShellProps {
  children: ReactNode;
}

export function AircraftShell({ children }: AircraftShellProps) {
  return (
    <div className="relative w-full overflow-x-auto custom-scrollbar select-none flex flex-row items-center justify-start py-12 px-2 sm:px-6 min-h-[500px] min-w-max">
      
      {/* Aircraft Nose (Left) */}
      <div className="relative w-32 md:w-48 h-[85%] sm:h-[75%] md:h-[65%] min-h-[300px] bg-[#f9fafb] border-t-2 border-b-2 border-l-2 border-[#e5e7eb] rounded-l-[50%] shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] z-0 flex items-center justify-start pr-8 shrink-0">
        {/* Cockpit Windows */}
        <div className="flex flex-col gap-1.5 opacity-60 ml-4">
           <div className="h-6 w-8 md:h-8 md:w-10 bg-sky-200/40 border border-sky-300 rounded-tl-full rounded-tr-sm transform -rotate-12"></div>
           <div className="h-10 w-8 md:h-14 md:w-10 bg-sky-200/40 border border-sky-300 rounded-l-xl"></div>
           <div className="h-6 w-8 md:h-8 md:w-10 bg-sky-200/40 border border-sky-300 rounded-bl-full rounded-br-sm transform rotate-12"></div>
        </div>
      </div>

      {/* Main Fuselage & Cabin (Middle) */}
      <div className="relative z-10 h-[90%] md:h-[85%] bg-[#f9fafb] border-t-2 border-b-2 border-[#e5e7eb] py-4 md:py-8 min-w-[500px] shrink-0 shadow-[inset_0_15px_20px_-15px_rgba(0,0,0,0.05),inset_0_-15px_20px_-15px_rgba(0,0,0,0.05)]">
        
        {/* Subtle fuselage panels/lines */}
        <div className="absolute left-0 right-0 top-4 h-px bg-gray-200/40" />
        <div className="absolute left-0 right-0 bottom-4 h-px bg-gray-200/40" />
        
        <div className="px-6 flex items-center">
          {children}
        </div>
      </div>

      {/* Aircraft Tail (Right) */}
      <div className="relative w-32 md:w-40 h-[85%] sm:h-[75%] md:h-[65%] min-h-[300px] bg-[#f9fafb] border-t-2 border-b-2 border-r-2 border-[#e5e7eb] rounded-r-[50%] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] z-0 flex items-center shrink-0">
      </div>

      {/* Wings (Decorative, Top and Bottom) */}
      <div className="absolute top-0 left-[35%] h-[15%] w-64 bg-gradient-to-br from-gray-200 to-gray-50 border-l-2 border-b-2 border-[#e5e7eb] rounded-bl-[100%] -z-10 shadow-lg transform -skew-x-12 translate-y-2"></div>
      <div className="absolute bottom-0 left-[35%] h-[15%] w-64 bg-gradient-to-tr from-gray-200 to-gray-50 border-l-2 border-t-2 border-[#e5e7eb] rounded-tl-[100%] -z-10 shadow-lg transform skew-x-12 -translate-y-2"></div>
    </div>
  );
}
