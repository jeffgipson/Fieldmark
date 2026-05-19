import useCountUp from "../../hooks/useCountUp";
import { formatCurrency, formatPerAcre } from "../../utils/format";

const SENTIMENT_STYLES = {
  up: { value: "text-fm-alert", bar: "bg-fm-alert" },
  down: { value: "text-fm-success", bar: "bg-fm-success" },
  neutral: { value: "text-fm-teal", bar: "bg-fm-teal" }
};

export default function MetricCard({
  label,
  value,
  unit = "perAcre",
  sentiment = "neutral",
  animate = true
}) {
  const numeric = Number(value) || 0;
  const animated = useCountUp(numeric, { enabled: animate });
  const display =
    unit === "perAcre"
      ? formatPerAcre(animated)
      : unit === "number"
        ? Math.round(animated).toLocaleString()
        : formatCurrency(animated);
  const styles = SENTIMENT_STYLES[sentiment] || SENTIMENT_STYLES.neutral;

  return (
    <div className="fm-card group relative overflow-hidden p-5">
      <div className={`absolute left-0 top-0 h-full w-1 ${styles.bar} opacity-80`} />
      <p className="text-xs font-bold uppercase tracking-wider text-fm-gray-medium">{label}</p>
      <p className={`fm-stat mt-2 text-3xl font-bold ${styles.value}`}>{display}</p>
    </div>
  );
}
