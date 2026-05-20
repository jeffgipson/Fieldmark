export default function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;
  const format = valueFormatter || ((v) => v);

  return (
    <div className="rounded-lg border border-fm-input-border bg-white px-3 py-2 text-sm shadow-fm-card">
      <p className="font-semibold text-fm-ink mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {format(entry.value)}
        </p>
      ))}
    </div>
  );
}
