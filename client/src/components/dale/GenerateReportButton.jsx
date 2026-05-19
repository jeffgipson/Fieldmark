import { useCallback, useState } from "react";
import { api } from "../../api/client";
import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "./DaleAvatar";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 60;

export default function GenerateReportButton({ token, scenarioId, onReportReady }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const pollReport = useCallback(
    async (report) => {
      if (report.status === "completed") {
        setStatus("completed");
        onReportReady?.(report);
        return;
      }
      if (report.status === "failed") {
        setStatus("error");
        setError(report.error_message || DALE_COPY.error);
        return;
      }

      for (let i = 0; i < MAX_POLLS; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        const latest = await api.getReport(token, scenarioId);
        if (latest.status === "completed") {
          setStatus("completed");
          onReportReady?.(latest);
          return;
        }
        if (latest.status === "failed") {
          setStatus("error");
          setError(latest.error_message || DALE_COPY.error);
          return;
        }
      }
      setStatus("error");
      setError(DALE_COPY.error);
    },
    [token, scenarioId, onReportReady]
  );

  async function handleGenerate() {
    if (!token || !scenarioId || status === "generating") return;

    setStatus("generating");
    setError(null);

    try {
      const report = await api.generateReport(token, scenarioId);
      if (report.status === "completed") {
        setStatus("completed");
        onReportReady?.(report);
      } else {
        await pollReport(report);
      }
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={status === "generating"}
        className="flex items-center gap-3 rounded-lg bg-fm-teal px-5 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-fm-teal-hover disabled:opacity-60"
      >
        {status === "generating" ? (
          <>
            <DaleAvatar variant="analyzing" size="sm" pulse className="!flex-row" />
            <span>{DALE_COPY.report.generating}</span>
          </>
        ) : (
          <span>Generate lender report</span>
        )}
      </button>

      {status === "completed" && (
        <p className="text-sm font-bold text-fm-success">{DALE_COPY.report.ready}</p>
      )}
      {error && (
        <p className="rounded-lg border border-fm-alert/30 bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">
          {error}
        </p>
      )}
    </div>
  );
}
