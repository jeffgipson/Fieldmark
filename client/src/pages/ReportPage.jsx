import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as reportsApi from "../api/reports";
import * as scenariosApi from "../api/scenarios";
import { DALE_COPY } from "../constants/dale";
import DaleAvatar from "../components/dale/DaleAvatar";
import ReportChartsRow from "../components/dale/ReportChartsRow";
import ReportFieldsSection from "../components/dale/ReportFieldsSection";
import ReportKeyMetrics from "../components/dale/ReportKeyMetrics";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ReportGeneratingState from "../components/dale/ReportGeneratingState";
import LoadingDale from "../components/ui/LoadingDale";
import { BRAND } from "../constants/brand";
import Logo from "../components/ui/Logo";
import { useFarm } from "../contexts/FarmContext";
import { formatAcres, formatCommodity, formatRegion } from "../utils/format";
import { friendlyError } from "../utils/errors";
import {
  formatReportList,
  formatReportParagraph
} from "../utils/reportContent";

export default function ReportPage() {
  const { id: paramId } = useParams();
  const { farm, fields, scenarios, primaryScenario } = useFarm();
  const scenarioId = paramId || primaryScenario?.id;
  const scenario = useMemo(
    () => scenarios.find((s) => String(s.id) === String(scenarioId)) || primaryScenario,
    [scenarios, scenarioId, primaryScenario]
  );
  const scenarioResults = scenario?.results;
  const [peerSummary, setPeerSummary] = useState(scenario?.peer_comparison?.summary ?? null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState("pending");
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailing, setEmailing] = useState(false);

  const reportComplete = report?.status === "completed";

  useEffect(() => {
    setPeerSummary(scenario?.peer_comparison?.summary ?? null);
  }, [scenario?.id, scenario?.peer_comparison?.summary]);

  useEffect(() => {
    if (!farm?.id || !scenarioId || peerSummary) return;
    let cancelled = false;
    scenariosApi
      .compareScenario(farm.id, scenarioId)
      .then((result) => {
        if (!cancelled) setPeerSummary(result?.peer_comparison?.summary ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [farm?.id, scenarioId, peerSummary]);

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
    return (
      <Card>
        <p className="text-fm-charcoal">Create a scenario first to generate a lender report.</p>
        <Link to="/scenarios" className="mt-3 inline-block text-sm font-bold text-fm-teal hover:underline">
          Go to scenarios →
        </Link>
      </Card>
    );
  }

  if (loading && !report) {
    return <LoadingDale message="Loading your lender report..." />;
  }

  if (generating) {
    return (
      <div>
        <p className="mb-4 text-sm text-fm-gray-medium">Dale is preparing your lender report…</p>
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

  const reportBtnClass = "!shrink-0 !px-3 !py-2 !text-sm whitespace-nowrap";

  function ReportActionsBar() {
    return (
      <div className="flex gap-2 overflow-x-auto pb-0.5 print:hidden max-lg:-mx-1 lg:flex-col lg:overflow-visible lg:min-w-[11rem]">
        <Button variant="secondary" className={reportBtnClass} onClick={handleGenerate}>
          {generateLabel}
        </Button>
        <Button variant="secondary" className={reportBtnClass} onClick={handleEmailReport} disabled={emailing}>
          {emailing ? "Sending…" : emailStatus ? "Sent ✓" : "Email"}
        </Button>
        <Button className={reportBtnClass} onClick={() => window.print()}>
          Print / PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="print:bg-white">
      {emailStatus && reportComplete && (
        <Card className="mb-4 border-fm-success/30 bg-fm-success/5 print:hidden">
          <p className="text-sm font-medium text-fm-success" role="status">
            {emailStatus}
          </p>
        </Card>
      )}

      {error && reportComplete && (
        <p className="mb-4 text-sm text-fm-alert print:hidden" role="alert">
          {error}
        </p>
      )}

      {reportComplete ? (
        <Card className="print:shadow-none max-lg:p-4">
          <header className="border-b border-fm-gray-light pb-4 max-lg:pt-0 lg:pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
                <Logo
                  size="sm"
                  className="hidden w-36 shrink-0 print:mb-4 print:block lg:mb-0 lg:block lg:w-48"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <DaleAvatar variant="avatar" size="sm" className="!items-start shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-snug text-fm-teal">
                        {DALE_COPY.report.header.preparedBy}
                      </p>
                      <p className="text-[0.65rem] leading-snug text-fm-gray-medium sm:text-xs">
                        {DALE_COPY.report.header.subtitle}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] leading-snug text-fm-gray-medium sm:text-xs">
                        {DALE_COPY.report.header.attribution}
                      </p>
                    </div>
                  </div>
                  <h1 className="font-display mt-2 text-xl font-bold text-fm-ink lg:mt-3 lg:text-2xl">
                    {farm?.name}
                  </h1>
                  <p className="mt-1 text-sm leading-snug text-fm-gray-medium">
                    {formatAcres(farm?.total_acres)} · {farm?.county} · {formatRegion(farm?.region)} ·{" "}
                    {formatCommodity(farm?.primary_commodity)} · Season 2026
                  </p>
                  {report.generated_at && (
                    <p className="mt-0.5 text-xs text-fm-gray-medium">
                      Generated {new Date(report.generated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 border-t border-fm-gray-light/80 pt-3 max-lg:-mx-1 lg:border-t-0 lg:pt-0">
                <ReportActionsBar />
              </div>
            </div>
          </header>

          <div className="mt-5 space-y-8 text-fm-charcoal lg:mt-6">
            {!scenarioResults?.base_case && (
              <p className="rounded-lg border border-fm-gold/40 bg-fm-gold/10 px-4 py-3 text-sm text-fm-charcoal">
                Run your scenario calculation to populate the charts and margin tables below. Field maps and
                Dale&apos;s narrative are still shown from your farm data.
              </p>
            )}

            <ReportKeyMetrics
              farm={farm}
              fields={fields}
              results={scenarioResults}
              peerSummary={peerSummary}
            />

            <ReportChartsRow results={scenarioResults} />

            <ReportFieldsSection fields={fields} byField={scenarioResults?.by_field} />

            {summary && (
              <section>
                <h2 className="font-display text-lg font-semibold">Executive Summary</h2>
                <p className="mt-2 leading-relaxed">{summary}</p>
              </section>
            )}
            {keyFindings.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Key Findings</h2>
                <ul className="mt-3 space-y-2">
                  {keyFindings.map((item, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-fm-gray-light/80 bg-fm-cream/40 px-4 py-3 text-sm leading-relaxed"
                    >
                      {item}
                    </li>
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
          {report?.status === "failed" && (
            <p className="mt-2 text-sm text-fm-gray-medium">
              Reports can take 1–2 minutes. In another terminal run{" "}
              <code className="rounded bg-fm-gray-light/60 px-1">cd api && bin/jobs</code>, then click
              Generate again.
            </p>
          )}
          <Button className="mt-4" onClick={handleGenerate}>
            {generateLabel}
          </Button>
          {error && <p className="mt-4 text-fm-alert">{error}</p>}
        </Card>
      )}
    </div>
  );
}
