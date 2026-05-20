export function formatCents(cents) {
  const amount = Number(cents) / 100;
  const sign = amount < 0 ? "-" : "";
  return `${sign}${Math.abs(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })}`;
}

export function formatCompactCents(cents) {
  const amount = Number(cents) / 100;
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCents(cents);
}
