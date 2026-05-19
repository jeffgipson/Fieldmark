export const MAX_PRIORITIES = 3;

export const PRIORITY_CATEGORIES = [
  {
    value: "input_costs",
    label: "Input costs & March commitments",
    hint: "Locking in seed, fertilizer, or chemicals before spring"
  },
  {
    value: "cash_flow",
    label: "Cash flow & operating credit",
    hint: "Paying bills between now and harvest"
  },
  {
    value: "lender_meeting",
    label: "Lender or financing conversation",
    hint: "Operating line, land note, or spring financing"
  },
  {
    value: "crop_insurance",
    label: "Crop insurance & risk protection",
    hint: "Revenue protection if yields or prices slip"
  },
  {
    value: "seed_fertility",
    label: "Seed, fertilizer, or chemicals",
    hint: "Specific products or application decisions"
  },
  {
    value: "labor_equipment",
    label: "Labor, equipment, or custom work",
    hint: "Hiring help, repairs, or custom application"
  },
  {
    value: "market_prices",
    label: "Commodity prices & marketing",
    hint: "When to sell, hedging, or price targets"
  },
  {
    value: "other",
    label: "Something else",
    hint: "Anything on your mind for this season"
  }
];

export const PRIORITY_STATUS_LABELS = {
  active: "Active",
  resolved: "Resolved"
};

export function categoryLabel(value) {
  return PRIORITY_CATEGORIES.find((c) => c.value === value)?.label || value;
}
