/** Blog categories — aligned with marketing plan content themes. */
export const BLOG_CATEGORIES = [
  {
    id: "before-march",
    slug: "before-march",
    label: "Before March",
    description: "Pre-season planning, the March commitment window, and carrying costs."
  },
  {
    id: "benchmarks",
    slug: "benchmarks",
    label: "Benchmarks",
    description: "MU Extension crop budgets and independent industry baselines."
  },
  {
    id: "peer-comparison",
    slug: "peer-comparison",
    label: "Peer Comparison",
    description: "How anonymized peer data helps you know where you stand."
  },
  {
    id: "financial-planning",
    slug: "financial-planning",
    label: "Financial Planning",
    description: "Margins, scenarios, and planning tools for Missouri operators."
  },
  {
    id: "for-advisors",
    slug: "for-advisors",
    label: "For Advisors",
    description: "For agronomists, co-op reps, and lenders who work with farmers."
  }
];

export const categoryById = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.id, c]));
