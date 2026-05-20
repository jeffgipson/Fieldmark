/** Tag vocabulary for blog posts — used for filtering and SEO. */
export const BLOG_TAGS = [
  { id: "missouri", label: "Missouri" },
  { id: "corn", label: "Corn" },
  { id: "soybean", label: "Soybean" },
  { id: "margins", label: "Margins" },
  { id: "fertilizer", label: "Fertilizer" },
  { id: "seed", label: "Seed" },
  { id: "mu-extension", label: "MU Extension" },
  { id: "peer-data", label: "Peer Data" },
  { id: "march", label: "March" },
  { id: "lenders", label: "Lenders" },
  { id: "co-ops", label: "Co-ops" },
  { id: "scenarios", label: "Scenarios" }
];

export const tagById = Object.fromEntries(BLOG_TAGS.map((t) => [t.id, t]));
