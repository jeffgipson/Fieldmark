export const PLAN_LABELS = {
  basic: "Basic",
  pro: "Pro"
};

export function formatPlanPrice(priceCents) {
  if (priceCents == null) return "—";
  return `$${(priceCents / 100).toFixed(0)}/mo`;
}

export function usageLabel(used, max) {
  if (max == null) return `${used} (unlimited)`;
  return `${used} / ${max}`;
}
