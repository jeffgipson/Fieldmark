import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as reportsApi from "../api/reports";
import DaleAvatar from "../components/dale/DaleAvatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ReportGeneratingState from "../components/dale/ReportGeneratingState";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { BRAND } from "../constants/brand";
import Logo from "../components/ui/Logo";
import { DALE_COPY } from "../constants/dale";
import { useFarm } from "../contexts/FarmContext";
import { formatAcres, formatCommodity, formatRegion } from "../utils/format";
import { friendlyError } from "../utils/errors";
import {
  formatReportList,
  formatReportParagraph
} from "../utils/reportContent";

export default function ReportPage() {
  const { id: paramId } = useParams();
  const { farm, primaryScenario } = useFarm();
  const scenarioId = paramId || primaryScenario?.id;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState("pending");
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailing, setEmailing] = useState(false);

  const reportComplete = report?.status === "completed";

  const loadReport = useCallback(async () => {
    if (!scenarioId) {
      setLoading(false);
      return;
    }
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
  }, [scenarioId]);

  useEffect(() => {
    if (!emailStatus) return;
    const id = setTimeout(() => setEmailStatus(null), 8000);
    return () => clearTimeout(id);
  }, [emailStatus]);

  async function handleEmailReport() {
    if (!scenarioId) return;
    setEmailing(true);
    setEmailStatus(null);
    setError(null);
    try {
      const result = await reportsApi.emailReport(scenarioId);
      setEmailStatus(result?.message || "Report sent to your email.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setEmailing(false);
    }
  }

  async function handleGenerate() {
    if (!scenarioId) {
      setError("Create a scenario first, then come back to generate your lender report.");
      return;
    }

    setGenerating(true);
    setJobStatus("pending");
    setPollCount(0);
    setError(null);
    try {
      const regenerate = Boolean(report);
      const pending = await reportsApi.generateReport(scenarioId, regenerate);
      setJobStatus(pending?.status || "pending");
      if (pending?.status === "completed") {
        setReport(pending);
      } else if (pending?.status === "failed") {
        setReport(pending);
        setError(pending.error_message || DALE_COPY.error);
      } else {
        const done = await reportsApi.pollReport(scenarioId, {
          onPoll: (latest, attempt) => {
            setPollCount(attempt);
            if (latest?.status) setJobStatus(latest.status);
          }
        });
        setReport(done);
        if (done?.status === "failed") {
          setError(done.error_message || DALE_COPY.error);
        }
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  if (!scenarioId) {
    return <PageHeader title="Reports" subtitle="Create a scenario first to generate a lender report." />;
  }

  if (loading && !report) {
    return <LoadingDale message="Loading your lender report..." />;
  }

  if (generating) {
    return (
      <div>
        <PageHeader title="Lender report" subtitle="Dale is working on this in the background." />
        <ReportGeneratingState status={jobStatus} pollCount={pollCount} />
      </div>
    );
  }

  const generateLabel = reportComplete ? "Regenerate report" : "Generate lender report";

  const summary = formatReportParagraph(report?.summary);
  const narrative = formatReportParagraph(report?.lender_narrative);
  const keyFindings = formatReportList(report?.key_findings);
  const riskFlags = formatReportList(report?.risk_flags);
  const recommendations = formatReportList(report?.recommendations);

  return (
    <div className="print:bg-white">
      <PageHeader
        title="Lender report"
        action={
          reportComplete ? (
            <div className="flex flex-col items-end gap-2 print:hidden">
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={handleGenerate}>
                  {generateLabel}
                </Button>
                <Button variant="secondary" onClick={handleEmailReport} disabled={emailing}>
                  {emailing ? "Sending…" : emailStatus ? "Sent ✓" : "Email me this report"}
                </Button>
                <Button onClick={() => window.print()}>Print / PDF</Button>
              </div>
              {emailStatus && (
                <p className="text-sm font-medium text-fm-success" role="status">
                  {emailStatus}
                </p>
              )}
              {error && (
                <p className="text-sm text-fm-alert" role="alert">
                  {error}
                </p>
              )}
            </div>
          ) : null
        }
      />

      {emailStatus && reportComplete && (
        <Card className="mb-4 border-fm-success/30 bg-fm-success/5 print:hidden">
          <p className="text-sm font-medium text-fm-success" role="status">
            {emailStatus}
          </p>
        </Card>
      )}

      {reportComplete ? (
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
                {formatAcres(farm?.total_acres)} · {farm?.county} · {formatRegion(farm?.region)} ·{" "}
                {formatCommodity(farm?.primary_commodity)} · Season 2026
              </p>
              {report.generated_at && (
                <p className="text-xs text-fm-gray-medium mt-1">
                  Generated {new Date(report.generated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </header>

          <div className="mt-6 space-y-6 text-fm-charcoal">
            {summary && (
              <section>
                <h2 className="font-display text-lg font-semibold">Executive Summary</h2>
                <p className="mt-2 leading-relaxed">{summary}</p>
              </section>
            )}
            {keyFindings.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Key Findings</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {keyFindings.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {riskFlags.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Key Risk Flags</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {riskFlags.map((item, i) => (
                    <li key={i} className="text-fm-gold">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {recommendations.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Recommendations</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {recommendations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {narrative && (
              <section>
                <h2 className="font-display text-lg font-semibold">Full Narrative</h2>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{narrative}</p>
              </section>
            )}
            <footer className="border-t pt-4 text-xs text-fm-gray-medium">
              <p>{BRAND.attribution.report}</p>
            </footer>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-fm-charcoal">
            {report?.status === "failed"
              ? report.error_message || DALE_COPY.error
              : report?.status === "pending" || report?.status === "processing"
                ? "A report is already being prepared. Click below to try again."
                : "No report yet. Generate one for your lender conversation."}
          </p>
          <Button className="mt-4" onClick={handleGenerate}>
            {generateLabel}
          </Button>
          {error && <p className="mt-4 text-fm-alert">{error}</p>}
        </Card>
      )}
    </div>
  );
}
