import http, { unwrap } from "./http";

export async function getReport(scenarioId) {
  const res = await http.get(`/api/v1/scenarios/${scenarioId}/report`);
  return unwrap(res);
}

export async function generateReport(scenarioId, regenerate = false) {
  const res = await http.post(
    `/api/v1/scenarios/${scenarioId}/report${regenerate ? "?regenerate=true" : ""}`
  );
  return unwrap(res);
}

export async function pollReport(
  scenarioId,
  { maxAttempts = 60, intervalMs = 2000, onPoll } = {}
) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const report = await getReport(scenarioId);
    onPoll?.(report, i + 1);
    if (report?.status === "completed" || report?.status === "failed") {
      return report;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Report generation timed out. If this keeps happening, run cd api && bin/jobs");
}

export async function emailReport(scenarioId) {
  const res = await http.post(`/api/v1/scenarios/${scenarioId}/report/email`);
  return unwrap(res);
}
