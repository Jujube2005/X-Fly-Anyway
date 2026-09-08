import type { ReactNode } from "react";

type BadgeVariant =
  | "yellow"
  | "green"
  | "blue"
  | "red"
  | "grey"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "scheduled"
  | "boarding"
  | "departed"
  | "arrived";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  yellow:     "bg-[#f5c800]/20 text-[#c9a200] border border-[#f5c800]/40",
  green:      "bg-green-100 text-green-700 border border-green-200",
  blue:       "bg-blue-100 text-blue-700 border border-blue-200",
  red:        "bg-red-100 text-red-700 border border-red-200",
  grey:       "bg-gray-100 text-gray-600 border border-gray-200",
  // Semantic aliases
  pending:    "bg-[#f5c800]/20 text-[#c9a200] border border-[#f5c800]/40",
  confirmed:  "bg-green-100 text-green-700 border border-green-200",
  cancelled:  "bg-red-100 text-red-700 border border-red-200",
  scheduled:  "bg-blue-100 text-blue-700 border border-blue-200",
  boarding:   "bg-[#f5c800]/20 text-[#c9a200] border border-[#f5c800]/40",
  departed:   "bg-gray-100 text-gray-600 border border-gray-200",
  arrived:    "bg-green-100 text-green-700 border border-green-200",
};

export function Badge({ variant = "grey", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
