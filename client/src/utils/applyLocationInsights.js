/** Merge location lookup results into farm or field form state. */
export function applyLocationInsights(prev, insights, { includeAcres = false } = {}) {
  if (!insights) return prev;

  const next = { ...prev };
  if (insights.county) next.county = insights.county;
  if (insights.region) next.region = insights.region;
  if (insights.suggested_soil_type) next.soil_type = insights.suggested_soil_type;
  if (insights.suggested_primary_commodity) {
    const commodity = insights.suggested_primary_commodity;
    if (commodity === "both") {
      next.primary_commodity = prev.primary_commodity || "corn";
    } else {
      next.primary_commodity = commodity;
    }
  }
  if (includeAcres && insights.acres != null) {
    next.acres = String(Math.round(insights.acres * 10) / 10);
  }
  if (insights.latitude != null) next.latitude = insights.latitude;
  if (insights.longitude != null) next.longitude = insights.longitude;
  return next;
}
