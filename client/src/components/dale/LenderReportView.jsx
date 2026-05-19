import { BRAND } from "../../constants/brand";
import {
  formatReportList,
  formatReportParagraph
} from "../../utils/reportContent";

export default function LenderReportView({ report, onClose }) {
  if (!report) return null;

  const summary = formatReportParagraph(report.summary);
  const narrative = formatReportParagraph(report.lender_narrative);
  const findings = formatReportList(report.key_findings);
  const risks = formatReportList(report.risk_flags);
  const recommendations = formatReportList(report.recommendations);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fm-gray-dark/50 p-4 print:relative print:bg-white print:p-0">
      <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl print:max-h-none print:shadow-none">
        <header className="sticky top-0 flex items-start justify-between border-b border-fm-gray-light bg-white px-6 py-4 print:static">
          <div>
            <h2 className="font-display text-xl font-bold text-fm-teal">Lender Report</h2>
            {report.generated_at && (
              <p className="mt-1 text-xs text-fm-gray-medium">
                Generated {new Date(report.generated_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-fm-gray-medium hover:text-fm-charcoal print:hidden"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </header>

        <div className="space-y-6 px-6 py-5 text-base leading-relaxed text-fm-charcoal print:text-black">
          {summary && (
            <section>
              <h3 className="font-display mb-2 font-semibold">Executive Summary</h3>
              <p>{summary}</p>
            </section>
          )}

          {findings.length > 0 && (
            <section>
              <h3 className="font-display mb-2 font-semibold">Key Findings</h3>
              <ul className="list-inside list-disc space-y-1">
                {findings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {risks.length > 0 && (
            <section>
              <h3 className="font-display mb-2 font-semibold">Key Risk Flags</h3>
              <ul className="list-inside list-disc space-y-1">
                {risks.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {recommendations.length > 0 && (
            <section>
              <h3 className="font-display mb-2 font-semibold">Recommendations</h3>
              <ul className="list-inside list-disc space-y-1">
                {recommendations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {narrative && (
            <section>
              <h3 className="font-display mb-2 font-semibold">Full Narrative</h3>
              <p className="whitespace-pre-wrap">{narrative}</p>
            </section>
          )}

          <footer className="border-t border-fm-gray-light pt-4">
            <p className="text-xs text-fm-gray-medium">{BRAND.attribution.report}</p>
          </footer>
        </div>

        <div className="px-6 pb-5 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full rounded-lg border-2 border-fm-teal py-2 text-base font-bold text-fm-teal transition-colors duration-200 hover:bg-fm-teal hover:text-white"
          >
            Print / Save as PDF
          </button>
        </div>
      </article>
    </div>
  );
}
