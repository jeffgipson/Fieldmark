import { COST_STATUS } from "../../utils/benchmark";

export default function CostStatusBadge({ status = "at_average" }) {
  const config = COST_STATUS[status] || COST_STATUS.at_average;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${config.badgeClass}`}
    >
      {config.label}
    </span>
  );
}
