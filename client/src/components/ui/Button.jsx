const VARIANTS = {
  primary:
    "bg-fm-teal text-white shadow-sm shadow-fm-teal/20 hover:bg-fm-teal-hover hover:shadow-md active:scale-[0.98] border-transparent",
  secondary:
    "bg-fm-surface text-fm-teal border border-fm-teal/30 shadow-sm hover:border-fm-teal hover:bg-fm-teal-subtle active:scale-[0.98]",
  ghost:
    "bg-transparent text-fm-charcoal border-transparent hover:bg-fm-gray-light/80 active:scale-[0.98]",
  danger:
    "bg-fm-alert text-white shadow-sm hover:opacity-95 active:scale-[0.98] border-transparent"
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-teal/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
