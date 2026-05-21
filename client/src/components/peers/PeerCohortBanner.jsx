import { Users } from "lucide-react";
import Card from "../ui/Card";
import { formatCohortDescription, formatCohortHeadline, formatCohortUnavailable, cohortProgress } from "../../utils/cohort";

export default function PeerCohortBanner({ cohort, region, commodity, variant = "default" }) {
  const available = cohort?.available;
  const headline = formatCohortHeadline(cohort, { region, commodity });
  const progress = cohortProgress(cohort);

  if (!available) {
    return (
      <Card variant="alert" className="mb-6">
        <p className="text-sm text-fm-charcoal">{formatCohortUnavailable(cohort)}</p>
        {progress && progress.current > 0 && (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-fm-gray-light">
              <div
                className="h-full rounded-full bg-fm-teal transition-all"
                style={{ width: `${(progress.current / progress.required) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-fm-gray-medium">
              {progress.current} of {progress.required} farms in your regional group
            </p>
          </div>
        )}
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <p className="text-sm text-fm-gray-medium">
        {formatCohortDescription(cohort, { region, commodity })}
      </p>
    );
  }

  return (
    <Card className="mb-6 border-2 border-fm-teal/25 bg-fm-teal-subtle/20 !p-5">
      <div className="flex gap-4">
        <span className="fm-icon-ring shrink-0 bg-white">
          <Users size={22} strokeWidth={2.25} className="text-fm-teal" />
        </span>
        <div>
          <p className="fm-eyebrow">Farms like yours</p>
          <p className="font-display mt-1 text-lg font-semibold text-fm-ink">{headline}</p>
          <p className="mt-1 text-sm text-fm-charcoal">
            Aggregated from operators who entered costs on Fieldmark — medians and percentiles only.
            Individual farms are never named.
          </p>
        </div>
      </div>
    </Card>
  );
}
