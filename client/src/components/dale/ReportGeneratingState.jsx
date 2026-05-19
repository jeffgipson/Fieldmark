import { useEffect, useMemo, useState } from "react";
import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "./DaleAvatar";
import Card from "../ui/Card";

const ROTATING_HINTS = [
  DALE_COPY.report.steps.comparing,
  DALE_COPY.report.steps.finishing,
  "Pulling downside margin into the risk section…",
  "Writing recommendations you can take to your lender…"
];

const STATUS_LABELS = {
  pending: DALE_COPY.report.steps.pending,
  processing: DALE_COPY.report.steps.processing
};

const PROGRESS_STEPS = [
  { afterPoll: 0, label: "Queued — Dale is starting on your report…" },
  { afterPoll: 2, label: "Analyzing your field costs and margins…" },
  { afterPoll: 5, label: "Drafting the lender narrative…" },
  { afterPoll: 8, label: "Polishing the executive summary…" }
];

export default function ReportGeneratingState({ status = "pending", pollCount = 0 }) {
  const [hintIndex, setHintIndex] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const showSidekiqHint = status === "pending" && pollCount >= 3;

  useEffect(() => {
    const id = setInterval(() => {
      setHintIndex((i) => (i + 1) % ROTATING_HINTS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const statusLine = useMemo(() => {
    if (STATUS_LABELS[status]) return STATUS_LABELS[status];
    const step = [...PROGRESS_STEPS].reverse().find((s) => pollCount >= s.afterPoll);
    if (step) return step.label;
    return ROTATING_HINTS[hintIndex];
  }, [status, hintIndex, pollCount]);

  return (
    <div className="animate-fm-in">
      <Card variant="flat" className="overflow-hidden border border-fm-teal/15 bg-fm-teal-subtle/20">
        <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
          <div className="relative animate-fm-shimmer">
            <div
              className="absolute inset-0 -m-3 animate-spin rounded-full border-2 border-fm-teal/20 border-t-fm-teal"
              aria-hidden
            />
            <DaleAvatar variant="analyzing" size="2xl" pulse className="!flex-row" />
          </div>
          <p className="mt-6 font-display text-xl font-semibold text-fm-charcoal">
            {DALE_COPY.report.generating}
          </p>
          <p className="mt-2 text-sm text-fm-gray-medium transition-opacity duration-500">
            {statusLine}
          </p>
          {elapsedSec >= 10 && (
            <p className="mt-2 text-xs text-fm-gray-medium">
              About {elapsedSec} seconds so far — lender reports usually take 15–30 seconds.
            </p>
          )}

          <div className="mt-8 w-full max-w-md space-y-3 text-left" aria-hidden>
            <div className="fm-report-skeleton-line w-3/4" style={{ animationDelay: "0ms" }} />
            <div className="fm-report-skeleton-line w-full" style={{ animationDelay: "200ms" }} />
            <div className="fm-report-skeleton-line w-5/6" style={{ animationDelay: "400ms" }} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="fm-report-skeleton-line h-16 w-full" style={{ animationDelay: "600ms" }} />
              <div className="fm-report-skeleton-line h-16 w-full" style={{ animationDelay: "800ms" }} />
            </div>
          </div>

          {showSidekiqHint && (
            <p className="mt-6 max-w-md rounded-xl border border-fm-gold/40 bg-fm-gold-muted px-4 py-3 text-left text-sm text-fm-charcoal">
              <span className="font-bold text-fm-gold">Background jobs may not be running.</span>{" "}
              {DALE_COPY.report.sidekiqHint}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
