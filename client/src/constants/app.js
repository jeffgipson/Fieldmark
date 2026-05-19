export const PLANNING_YEAR = 2026;

export const REGIONS = [
  { value: "northern", label: "Northern Missouri" },
  { value: "central", label: "Central Missouri" },
  { value: "southwest", label: "Southwest Missouri" }
];

export const COMMODITIES = [
  { value: "corn", label: "Corn" },
  { value: "soybean", label: "Soybean" },
  { value: "both", label: "Both" }
];

export const FIELD_COMMODITIES = [
  { value: "corn", label: "Corn" },
  { value: "soybean", label: "Soybean" }
];

export const INPUT_CATEGORIES = [
  { key: "seed", label: "Seed" },
  { key: "fertilizer", label: "Fertilizer" },
  { key: "chemicals", label: "Chemicals" },
  { key: "labor", label: "Labor" },
  { key: "other", label: "Other" }
];

/** Extension 2026 regional reference $/acre (display only). */
export const BENCHMARK_REFERENCE = {
  corn: { seed: 99.38, fertilizer: 187.01, chemicals: 104 },
  soybean: { seed: 75, fertilizer: 91.28, chemicals: 58 }
};

export const DEMO_CREDENTIALS = {
  email: "demo@fieldmark.app",
  password: "password123"
};

export const DALE_SUGGESTIONS = [
  "What does my fertilizer cost mean for March?",
  "Show me my worst case scenario.",
  "Am I in a good position to lock in inputs now?",
  "What should I bring to my lender?"
];
