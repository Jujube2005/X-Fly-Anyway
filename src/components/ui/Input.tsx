import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  glassStyle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconRight,
      glassStyle = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    const baseInput = glassStyle
      ? "w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all duration-200 backdrop-blur-sm"
      : "w-full bg-white border border-[#e5e7eb] text-[#111827] placeholder:text-[#9ca3af] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all duration-200";

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`text-sm font-medium ${glassStyle ? "text-white/80" : "text-[#374151]"}`}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              baseInput,
              icon ? "pl-10" : "",
              iconRight ? "pr-10" : "",
              error ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
