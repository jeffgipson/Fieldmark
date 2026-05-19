import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import Card from "../ui/Card";
import { SCENARIO_COPY } from "../../constants/scenarios";

export default function ScenarioJourneySteps({ steps, nextHref, nextLabel }) {
  return (
    <Card variant="dale" className="mb-8 !p-0 overflow-hidden" hover={false}>
      <div className="border-b border-fm-gray-light/80 bg-fm-teal-subtle/40 px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-fm-ink">
          {SCENARIO_COPY.journey.title}
        </h2>
      </div>
      <ol className="divide-y divide-fm-gray-light/80">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-4 px-6 py-4">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step.done
                  ? "bg-fm-success text-white"
                  : step.active
                    ? "bg-fm-teal text-white ring-4 ring-fm-teal/20"
                    : "bg-fm-gray-light text-fm-gray-medium"
              }`}
              aria-hidden
            >
              {step.done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`font-display font-semibold ${
                  step.active ? "text-fm-teal" : "text-fm-ink"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-fm-charcoal/90">
                {step.description}
              </p>
              {step.active && step.href && (
                <Link
                  to={step.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-fm-teal hover:underline"
                >
                  Do this step
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
      {nextHref && nextLabel && (
        <div className="border-t border-fm-gray-light/80 bg-fm-surface px-6 py-4">
          <Link
            to={nextHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fm-teal px-6 py-3 text-base font-bold text-white shadow-sm shadow-fm-teal/20 transition-all hover:bg-fm-teal-hover sm:w-auto"
          >
            {nextLabel}
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      )}
    </Card>
  );
}
