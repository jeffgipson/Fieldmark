export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-fm-gray-light/80 pb-8 animate-fm-in">
      <div className="max-w-2xl">
        {eyebrow && <p className="fm-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-tight text-fm-ink md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg leading-relaxed text-fm-charcoal/90">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
