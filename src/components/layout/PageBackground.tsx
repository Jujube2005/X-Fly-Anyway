import type { ReactNode } from "react";

type BgVariant =
  | "home"
  | "sky"
  | "dark-sky"
  | "airport"
  | "dark-purple"
  | "admin"
  | "plain";

interface PageBackgroundProps {
  variant?: BgVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BgVariant, string> = {
  // Home: purple/blue/orange mesh gradient — matches design exactly
  home: "bg-[radial-gradient(ellipse_at_top_left,_#6b21a8_0%,_#1e40af_30%,_#0f172a_60%,_#c2410c_100%)] min-h-dvh",
  // Sky: light blue-to-white for cabin class/seat
  sky: "bg-[linear-gradient(180deg,_#bfdbfe_0%,_#e0f2fe_40%,_#f0f9ff_100%)] min-h-dvh",
  // Dark sky: deep blue with yellow glow — passenger/contact form
  "dark-sky": "bg-[radial-gradient(ellipse_at_bottom_left,_#713f12_0%,_#1e1b4b_30%,_#0f172a_60%,_#0f172a_100%)] min-h-dvh",
  // Airport: blurred bg simulation for booking summary/payment
  airport: "bg-[linear-gradient(135deg,_#1e293b_0%,_#334155_50%,_#1e293b_100%)] min-h-dvh",
  // Booking confirmed: deep dark purple
  "dark-purple": "bg-[radial-gradient(ellipse_at_center,_#2d1b69_0%,_#1a0a3c_50%,_#0d0621_100%)] min-h-dvh",
  // Admin: light blue-grey
  admin: "bg-[#e8eef5] min-h-dvh",
  // Plain white
  plain: "bg-white min-h-dvh",
};

export function PageBackground({ variant = "plain", children, className = "" }: PageBackgroundProps) {
  return (
    <div className={`relative ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
