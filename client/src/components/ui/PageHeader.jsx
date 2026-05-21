export default function PageHeader({ eyebrow, title, subtitle, action, hideEyebrowOnMobile = false }) {
  return (
    <header className="mb-4 animate-fm-in max-lg:mb-5 lg:mb-10 lg:border-b lg:border-fm-gray-light/80 lg:pb-8">
      {eyebrow && (
        <p
          className={`fm-eyebrow mb-1.5 lg:mb-2 ${hideEyebrowOnMobile ? "max-lg:sr-only" : ""}`}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex items-start justify-between gap-3 lg:gap-6">
        <div className="max-w-2xl min-w-0 flex-1">
          <h1 className="font-display text-[1.625rem] font-bold leading-[1.2] tracking-tight text-fm-ink lg:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-snug text-fm-gray-medium max-lg:line-clamp-2 lg:mt-3 lg:text-lg lg:leading-relaxed lg:text-fm-charcoal/90">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-start pt-0.5 [&_button]:w-auto">{action}</div>
        )}
      </div>
    </header>
  );
}
