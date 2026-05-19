export function Label({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-fm-charcoal"
    >
      {children}
    </label>
  );
}

import { forwardRef } from "react";

const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3 text-base text-fm-charcoal placeholder:text-fm-gray-medium focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15 ${className}`}
      {...props}
    />
  );
});

export default Input;

export function DollarInput({
  value,
  onChange,
  placeholder = "0.00",
  compact = false,
  className = "",
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-fm-gray-medium ${
          compact ? "left-2.5 text-sm" : "left-4"
        }`}
      >
        $
      </span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={
          compact
            ? "fm-stat w-full rounded-lg border border-fm-input-border/80 bg-white py-2 pl-7 pr-2 text-right text-sm font-semibold text-fm-ink shadow-sm focus:border-fm-teal focus:outline-none focus:ring-2 focus:ring-fm-teal/15"
            : "w-full rounded-lg border-[1.5px] border-fm-input-border bg-white py-3 pl-8 pr-4 text-base focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15"
        }
        {...props}
      />
    </div>
  );
}
