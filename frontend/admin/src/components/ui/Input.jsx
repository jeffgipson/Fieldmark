import { forwardRef } from "react";

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
