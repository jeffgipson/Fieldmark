import { useState } from "react";
import Card from "../ui/Card";

const RATING_STYLES = {
  favorable: "border-fm-success/50 bg-fm-success/5 text-fm-success",
  moderate: "border-fm-gold/50 bg-fm-gold/10 text-fm-charcoal",
  elevated: "border-fm-alert/50 bg-fm-alert/10 text-fm-alert",
  insufficient_data: "border-fm-gray-light bg-fm-gray-light/40 text-fm-gray-medium"
};

const STATUS_DOT = {
  favorable: "bg-fm-success",
  watch: "bg-fm-gold",
  concern: "bg-fm-alert",
  unknown: "bg-fm-gray-medium"
};

function PillarSection({ pillar }) {
  const [open, setOpen] = useState(pillar.rating !== "favorable");

  return (
    <div className="border-b border-fm-gray-light/60 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-fm-ink">{pillar.label}</span>
        <span className="text-xs font-bold uppercase tracking-wide text-fm-gray-medium">
          {pillar.rating === "elevated" ? "Elevated" : pillar.rating}
          <span className="ml-2">{open ? "−" : "+"}</span>
        </span>
      </button>
      {open && (
        <ul className="space-y-2 pb-3">
          {pillar.factors.map((factor) => (
            <li key={factor.key} className="flex gap-2 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[factor.status] || STATUS_DOT.unknown}`}
                title={factor.status}
              />
              <div>
                <p className="font-medium text-fm-charcoal">{factor.label}</p>
                <p className="text-fm-gray-medium">{factor.detail}</p>
                {factor.source && (
                  <p className="mt-0.5 text-xs text-fm-gray-medium">
                    {factor.source_url ? (
                      <a href={factor.source_url} target="_blank" rel="noreferrer" className="text-fm-teal hover:underline">
                        {factor.source}
                      </a>
                    ) : (
                      factor.source
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function UnderwritingSummaryPanel({ underwriting }) {
  if (!underwriting?.pillars?.length) return null;

  const ratingClass = RATING_STYLES[underwriting.rating] || RATING_STYLES.moderate;

  return (
    <Card className="border-2 border-fm-teal/30">
      <p className="fm-eyebrow">Before you talk to your lender</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold">What to expect in the room</h3>
          <p className="mt-1 max-w-2xl text-sm text-fm-gray-medium">
            Same kind of read a lender or insurer starts with — so you are not surprised by the questions.
          </p>
          <p className="mt-2 max-w-2xl text-sm font-medium text-fm-charcoal">{underwriting.summary}</p>
        </div>
        <div className={`rounded-lg border px-4 py-2 text-center ${ratingClass}`}>
          <p className="text-xs font-bold uppercase tracking-wide">Overall</p>
          <p className="font-display text-lg font-bold">{underwriting.rating_label}</p>
          <p className="text-xs opacity-80">Confidence: {underwriting.confidence}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-fm-gray-medium">{underwriting.disclaimer}</p>

      <div className="mt-4 divide-y divide-fm-gray-light/60 rounded-lg border border-fm-gray-light px-3">
        {underwriting.pillars.map((pillar) => (
          <PillarSection key={pillar.key} pillar={pillar} />
        ))}
      </div>

      {(underwriting.concern_count > 0 || underwriting.watch_count > 0) && (
        <p className="mt-3 text-xs text-fm-gray-medium">
          {underwriting.concern_count} concern · {underwriting.watch_count} watch — address these in your scenario or
          notes before the meeting; pair with your lender report when you are ready to share numbers.
        </p>
      )}
    </Card>
  );
}
