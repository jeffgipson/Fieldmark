const VARIANTS = {
  standard: "fm-card",
  dale: "fm-card border-l-[3px] border-l-fm-teal shadow-[var(--shadow-fm-highlight)]",
  alert: "fm-card border-l-[3px] border-l-fm-gold bg-fm-gold-muted",
  danger: "fm-card border-l-[3px] border-l-fm-alert bg-[#fff8f8]",
  flat: "rounded-2xl border border-fm-gray-light bg-fm-surface"
};

export default function Card({ variant = "standard", className = "", children, hover = true }) {
  const base = VARIANTS[variant] || VARIANTS.standard;
  const hoverClass = hover && variant === "standard" ? "" : "";

  return <div className={`p-6 ${base} ${hoverClass} ${className}`}>{children}</div>;
}
