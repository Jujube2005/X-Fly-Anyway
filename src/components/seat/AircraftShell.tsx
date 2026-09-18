"use client";

import { ReactNode } from "react";

interface AircraftShellProps {
  children: ReactNode;
}

export function AircraftShell({ children }: AircraftShellProps) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
      {/* The airplane container that expands with children */}
      <div className="min-w-max flex flex-row items-stretch mx-auto relative group">
        
        {/* Aircraft Nose (Left) */}
        <div className="w-24 sm:w-32 bg-[#f9fafb] border-2 border-r-0 border-[#e5e7eb] rounded-l-[100px] shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] relative flex items-center shrink-0 z-10">
           {/* Cockpit */}
           <div className="flex flex-col gap-1.5 opacity-40 ml-3">
             <div className="h-6 w-8 bg-sky-300 rounded-tl-full border border-sky-400"></div>
             <div className="h-8 w-10 bg-sky-300 rounded-l-xl border border-sky-400"></div>
             <div className="h-6 w-8 bg-sky-300 rounded-bl-full border border-sky-400"></div>
           </div>
        </div>

        {/* Main Fuselage (Center) */}
        <div className="bg-[#f9fafb] border-t-2 border-b-2 border-[#e5e7eb] py-6 sm:py-8 px-2 sm:px-4 relative shrink-0 shadow-[inset_0_15px_20px_-15px_rgba(0,0,0,0.05),inset_0_-15px_20px_-15px_rgba(0,0,0,0.05)]">
          {children}
        </div>

        {/* Aircraft Tail (Right) */}
        <div className="w-24 sm:w-32 bg-[#f9fafb] border-2 border-l-0 border-[#e5e7eb] rounded-r-[100px] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] relative flex items-center shrink-0 z-10">
        </div>

      </div>
    </div>
  );
}
