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

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3 text-base text-fm-charcoal placeholder:text-fm-gray-medium focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15 ${className}`}
      {...props}
    />
  );
}

export function DollarInput({ value, onChange, placeholder = "0.00", ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fm-gray-medium">
        $
      </span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border-[1.5px] border-fm-input-border bg-white py-3 pl-8 pr-4 text-base focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15"
        {...props}
      />
    </div>
  );
}
