const variants = {
  primary:
    "bg-fm-teal text-white hover:bg-fm-teal-hover shadow-lg shadow-fm-teal/20",
  secondary:
    "border-2 border-white/90 text-white hover:bg-white hover:text-fm-gray-dark",
  outline:
    "border-2 border-fm-teal text-fm-teal hover:bg-fm-teal hover:text-white",
  ghost: "text-fm-charcoal hover:bg-fm-gray-light"
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3",
    "font-body text-base font-bold transition-all duration-200",
    variants[variant],
    className
  ].join(" ");

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
