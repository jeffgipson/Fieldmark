import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as reportsApi from "../api/reports";
import DaleAvatar from "../components/dale/DaleAvatar";
import DaleDisclaimer from "../components/dale/DaleDisclaimer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { BRAND } from "../constants/brand";
import Logo from "../components/ui/Logo";
import { DALE_COPY } from "../constants/dale";
import { useFarm } from "../contexts/FarmContext";
import { formatCommodity, formatRegion } from "../utils/format";
import { friendlyError } from "../utils/errors";

export default function ReportPage() {
  const { id: paramId } = useParams();
  const { farm, primaryScenario } = useFarm();
  const scenarioId = paramId || primaryScenario?.id;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadReport() {
    if (!scenarioId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getReport(scenarioId);
      setReport(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const pending = await reportsApi.generateReport(scenarioId);
      if (pending.status === "completed") {
        setReport(pending);
      } else {
        const done = await reportsApi.pollReport(scenarioId);
        setReport(done);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [scenarioId]);

  if (!scenarioId) {
    return <PageHeader title="Reports" subtitle="Create a scenario first to generate a lender report." />;
  }

  if (loading && !report) return <LoadingDale message="Putting together your lender report..." />;

  return (
    <div className="print:bg-white">
      <PageHeader
        title="Lender report"
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" onClick={handleGenerate} disabled={loading}>
              {report?.status === "completed" ? "Regenerate" : "Generate report"}
            </Button>
            {report?.status === "completed" && (
              <Button onClick={() => window.print()}>Print / PDF</Button>
            )}
          </div>
        }
      />

      {report?.status === "completed" ? (
        <Card className="print:shadow-none">
          <header className="flex items-start gap-4 border-b border-fm-gray-light pb-6">
            <Logo size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <DaleAvatar variant="avatar" size="sm" />
                <p className="text-sm font-bold text-fm-teal">Prepared by Dale, Fieldmark Agricultural Analyst</p>
              </div>
              <p className="mt-2 font-display text-xl font-bold">{farm?.name}</p>
              <p className="text-sm text-fm-gray-medium">
                {farm?.total_acres} acres · {farm?.county} · {formatRegion(farm?.region)} · {formatCommodity(farm?.primary_commodity)} · Season 2026
              </p>
              {report.generated_at && (
                <p className="text-xs text-fm-gray-medium mt-1">
                  Generated {new Date(report.generated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </header>

          <div className="mt-6 space-y-6 text-fm-charcoal">
            {report.summary && (
              <section>
                <h2 className="font-display text-lg font-semibold">Executive Summary</h2>
                <p className="mt-2 leading-relaxed">{report.summary}</p>
              </section>
            )}
            {Array.isArray(report.key_findings) && report.key_findings.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Key Findings</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {report.key_findings.map((item, i) => (
                    <li key={i}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              </section>
            )}
            {Array.isArray(report.risk_flags) && report.risk_flags.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Key Risk Flags</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {report.risk_flags.map((item, i) => (
                    <li key={i} className="text-fm-gold">{typeof item === "string" ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              </section>
            )}
            {Array.isArray(report.recommendations) && report.recommendations.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Recommendations</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {report.recommendations.map((item, i) => (
                    <li key={i}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              </section>
            )}
            {report.lender_narrative && (
              <section>
                <h2 className="font-display text-lg font-semibold">Full Narrative</h2>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{report.lender_narrative}</p>
              </section>
            )}
            <footer className="border-t pt-4 text-xs text-fm-gray-medium space-y-2">
              <p>{BRAND.attribution.benchmark}</p>
              <DaleDisclaimer />
            </footer>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-fm-charcoal">
            {report?.status === "failed"
              ? report.error_message || DALE_COPY?.error
              : "No report yet. Generate one for your lender conversation."}
          </p>
          <Button className="mt-4" onClick={handleGenerate} disabled={loading}>
            Generate lender report
          </Button>
        </Card>
      )}
      {error && <p className="mt-4 text-fm-alert">{error}</p>}
    </div>
  );
}
