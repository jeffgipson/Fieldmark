import { formatCommodity, formatRegion } from "./format";

const MIN_COHORT_SIZE = 5;

/** Short label for page headers, e.g. "47 farms like yours" */
export function formatCohortHeadline(cohort, { region, commodity } = {}) {
  if (!cohort?.available || !cohort?.size) return null;
  const regionLabel = formatRegion(region || cohort.region);
  const commodityLabel = formatCommodity(commodity || cohort.commodity);
  return `${cohort.size} ${commodityLabel} farms in ${regionLabel} Missouri`;
}

/** One-line description under a section title */
export function formatCohortDescription(cohort, { region, commodity } = {}) {
  const headline = formatCohortHeadline(cohort, { region, commodity });
  if (!headline) return null;
  return `${headline} — anonymized medians only, never farm names.`;
}

/** Message when cohort is not yet available */
export function formatCohortUnavailable(cohort) {
  const size = cohort?.size ?? 0;
  if (size > 0 && size < MIN_COHORT_SIZE) {
    return `Building your regional group (${size} of ${MIN_COHORT_SIZE} farms). Extension benchmarks below until the cohort is large enough.`;
  }
  return "Not enough farms in your region yet — showing MU Extension benchmarks until your peer group reaches five operators.";
}

export function cohortProgress(cohort) {
  const size = cohort?.size ?? 0;
  if (cohort?.available) return null;
  return { current: size, required: MIN_COHORT_SIZE };
}
