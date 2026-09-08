import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  glassStyle?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, glassStyle = false, options, placeholder, className = "", id, ...props },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    const baseSelect = glassStyle
      ? "w-full bg-white/10 border border-white/30 text-white rounded-xl px-4 py-3 pr-10 text-base focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all duration-200 appearance-none cursor-pointer"
      : "w-full bg-white border border-[#e5e7eb] text-[#111827] rounded-xl px-4 py-3 pr-10 text-base focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all duration-200 appearance-none cursor-pointer";

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={`text-sm font-medium ${glassStyle ? "text-white/80" : "text-[#374151]"}`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              baseSelect,
              error ? "border-red-400" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke={glassStyle ? "rgba(255,255,255,0.6)" : "#6b7280"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
