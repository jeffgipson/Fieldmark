import Card from "./Card";

export default function StatCard({ title, value, hint, className = "" }) {
  return (
    <Card className={`min-w-0 ${className}`}>
      <p className="text-xl sm:text-2xl font-bold font-display text-fm-ink tabular-nums leading-tight break-words">
        {value}
      </p>
      <p className="mt-1 text-sm text-fm-gray-medium">{title}</p>
      {hint && <p className="text-xs text-fm-gray-medium mt-1">{hint}</p>}
    </Card>
  );
}
