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

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-fm-alert">
      {children}
    </p>
  );
}

const Input = forwardRef(function Input({ className = "", error, id, ...props }, ref) {
  const errorClass = error
    ? "border-fm-alert focus:border-fm-alert focus:ring-fm-alert/15"
    : "border-fm-input-border focus:border-fm-teal focus:ring-fm-teal/15";

  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={`w-full rounded-lg border-[1.5px] bg-white px-4 py-3 text-base text-fm-charcoal placeholder:text-fm-gray-medium focus:outline-none focus:ring-[3px] ${errorClass} ${className}`}
      {...props}
    />
  );
});

export default Input;

export const Select = forwardRef(function Select({ className = "", error, id, children, ...props }, ref) {
  const errorClass = error
    ? "border-fm-alert focus:border-fm-alert focus:ring-fm-alert/15"
    : "border-fm-input-border focus:border-fm-teal focus:ring-fm-teal/15";

  return (
    <select
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={`w-full rounded-lg border-[1.5px] bg-white px-4 py-3 text-base text-fm-charcoal focus:outline-none focus:ring-[3px] ${errorClass} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

export function FormSection({ title, children, className = "" }) {
  return (
    <div className={`sm:col-span-2 ${className}`}>
      {title ? (
        <p className="mb-3 border-t border-fm-gray-light/80 pt-5 text-sm font-semibold text-fm-charcoal">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

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
