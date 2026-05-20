import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Play, Sparkles } from "lucide-react";
import { ALL_ENDPOINTS, findEndpoint } from "../../constants/apiCatalog";
import { runApiRequest } from "../../lib/runApiRequest";
import { fetchAccountIds } from "../../lib/hydratePlaygroundIds";
import { getBaseUrl, getToken, setBaseUrl, setToken } from "../../lib/playgroundStorage";
import MethodBadge from "./MethodBadge";
import CodeBlock from "./CodeBlock";

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

function initPathParams(endpoint) {
  const params = {};
  (endpoint.pathParams || []).forEach((p) => {
    params[p.name] = p.example ?? "";
  });
  return params;
}

function initQueryParams(endpoint) {
  const params = {};
  (endpoint.queryParams || []).forEach((p) => {
    params[p.name] = p.example ?? "";
  });
  return params;
}

export default function ApiPlayground({ selectedId, onSelectEndpoint }) {
  const endpoint = findEndpoint(selectedId);
  const [baseUrl, setBaseUrlState] = useState(getBaseUrl);
  const [token, setTokenState] = useState(getToken);
  const [pathParams, setPathParams] = useState(() => initPathParams(endpoint));
  const [queryParams, setQueryParams] = useState(() => initQueryParams(endpoint));
  const [bodyText, setBodyText] = useState(() =>
    JSON.stringify(endpoint.sampleBody ?? {}, null, 2)
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [idsLoading, setIdsLoading] = useState(false);

  useEffect(() => {
    const ep = findEndpoint(selectedId);
    setPathParams(initPathParams(ep));
    setQueryParams(initQueryParams(ep));
    setBodyText(JSON.stringify(ep.sampleBody ?? {}, null, 2));
    setResult(null);
  }, [selectedId]);

  const saveBase = (v) => {
    setBaseUrlState(v);
    setBaseUrl(v);
  };

  const saveToken = (v) => {
    setTokenState(v);
    setToken(v);
  };

  const send = useCallback(async () => {
    if (endpoint.auth && !token) {
      setResult({
        ok: false,
        networkError: true,
        message: "This endpoint requires a JWT. Click Demo JWT or paste a token from login.",
        durationMs: 0
      });
      return;
    }

    setLoading(true);
    setResult(null);
    let body = null;
    if (METHODS_WITH_BODY.includes(endpoint.method) && bodyText.trim()) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        setResult({
          ok: false,
          networkError: true,
          message: "Request body is not valid JSON.",
          durationMs: 0
        });
        setLoading(false);
        return;
      }
    }

    const res = await runApiRequest({
      baseUrl,
      method: endpoint.method,
      pathTemplate: endpoint.path,
      pathParams,
      queryParams,
      body,
      token,
      authRequired: endpoint.auth
    });

    if (res.ok && res.data?.data?.token) {
      saveToken(res.data.data.token);
    }

    setResult(res);
    setLoading(false);
  }, [baseUrl, bodyText, endpoint, pathParams, queryParams, token]);

  const demoLogin = async () => {
    setDemoLoading(true);
    const res = await runApiRequest({
      baseUrl,
      method: "POST",
      pathTemplate: "/api/v1/auth/demo",
      pathParams: {},
      queryParams: {},
      body: {},
      token: "",
      authRequired: false
    });
    if (res.ok && res.data?.data?.token) {
      saveToken(res.data.data.token);
      await applyAccountIds();
    }
    setResult(res);
    setDemoLoading(false);
  };

  const applyAccountIds = async () => {
    setIdsLoading(true);
    const ids = await fetchAccountIds();
    if (ids) {
      setPathParams((prev) => {
        const next = { ...prev };
        Object.entries(ids).forEach(([key, value]) => {
          if (value && key in next) next[key] = value;
        });
        return next;
      });
    }
    setIdsLoading(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        send();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [send]);

  const curlPreview = useMemo(() => {
    const path = endpoint.path.replace(/:(\w+)/g, (_, k) => pathParams[k] || `:${k}`);
    const url = `${(baseUrl || "").replace(/\/$/, "") || window.location.origin}${path}`;
    const lines = [`curl -s -X ${endpoint.method} '${url}'`, "-H 'Accept: application/json'"];
    if (token) lines.push(`-H 'Authorization: Bearer ${token}'`);
    if (METHODS_WITH_BODY.includes(endpoint.method) && bodyText.trim()) {
      lines.push("-H 'Content-Type: application/json'");
      lines.push(`-d '${bodyText.replace(/'/g, "'\\''")}'`);
    }
    return lines.join(" \\\n  ");
  }, [baseUrl, bodyText, endpoint, pathParams, token]);

  const usesProxy =
    typeof window !== "undefined" &&
    baseUrl.replace(/\/$/, "") === window.location.origin;

  return (
    <div className="dev-card overflow-hidden">
      <div className="border-b border-fm-gray-medium/15 bg-gradient-to-r from-fm-teal/10 to-transparent px-5 py-5 sm:px-6">
        <h2 className="font-display text-xl font-bold text-fm-gray-dark">API playground</h2>
        <p className="mt-1 max-w-2xl text-sm text-fm-charcoal">
          Send live requests. Tokens are stored in this browser only.{" "}
          <kbd className="rounded border border-fm-gray-medium/30 bg-white px-1.5 py-0.5 font-mono text-[10px]">
            ⌘ Enter
          </kbd>{" "}
          to send.
        </p>
        {usesProxy && (
          <p className="mt-2 text-xs text-fm-teal-dark">
            Using same-origin <code className="font-mono">/api</code> proxy — no CORS setup needed.
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-fm-gray-medium/15">
        <div className="space-y-4 p-5 sm:p-6">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">
              Base URL
            </span>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => saveBase(e.target.value)}
              className="dev-input mt-1"
              placeholder="http://localhost:3000"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">
              Bearer token
            </span>
            <div className="mt-1 flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => saveToken(e.target.value)}
                className="dev-input min-w-0 flex-1"
                placeholder="From login or demo"
              />
              <button
                type="button"
                onClick={demoLogin}
                disabled={demoLoading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-fm-teal px-3 py-2 text-sm font-bold text-white transition hover:bg-fm-teal-hover disabled:opacity-50"
              >
                {demoLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Demo JWT
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">
              Endpoint
            </span>
            <select
              value={selectedId}
              onChange={(e) => onSelectEndpoint(e.target.value)}
              className="dev-input mt-1 font-sans"
            >
              {ALL_ENDPOINTS.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.method} {ep.path} — {ep.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-fm-gray-light bg-fm-cream/60 px-3 py-2.5">
            <MethodBadge method={endpoint.method} />
            <code className="break-all font-mono text-sm text-fm-gray-dark">{endpoint.path}</code>
            {endpoint.auth && (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                Auth
              </span>
            )}
          </div>

          {(endpoint.pathParams || []).length > 0 && (
            <fieldset className="space-y-2 rounded-lg border border-fm-gray-light p-3">
              <legend className="flex w-full items-center justify-between gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">
                <span>Path parameters</span>
                {token && (
                  <button
                    type="button"
                    onClick={applyAccountIds}
                    disabled={idsLoading}
                    className="normal-case text-fm-teal-dark hover:underline disabled:opacity-50"
                  >
                    {idsLoading ? "Loading…" : "Use my IDs"}
                  </button>
                )}
              </legend>
              {endpoint.pathParams.map((p) => (
                <label key={p.name} className="flex items-center gap-2 text-sm">
                  <span className="w-28 shrink-0 font-mono text-fm-teal-dark">:{p.name}</span>
                  <input
                    value={pathParams[p.name] ?? ""}
                    onChange={(e) => setPathParams((prev) => ({ ...prev, [p.name]: e.target.value }))}
                    className="dev-input flex-1 py-1.5"
                  />
                </label>
              ))}
            </fieldset>
          )}

          {(endpoint.queryParams || []).length > 0 && (
            <fieldset className="space-y-2 rounded-lg border border-fm-gray-light p-3">
              <legend className="px-1 text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">
                Query parameters
              </legend>
              {endpoint.queryParams.map((p) => (
                <label key={p.name} className="block text-sm">
                  <span className="font-mono">
                    {p.name}
                    {p.required && <span className="text-fm-alert"> *</span>}
                  </span>
                  <input
                    value={queryParams[p.name] ?? ""}
                    onChange={(e) => setQueryParams((prev) => ({ ...prev, [p.name]: e.target.value }))}
                    placeholder={p.hint || p.example}
                    className="dev-input mt-0.5 py-1.5"
                  />
                </label>
              ))}
            </fieldset>
          )}

          {METHODS_WITH_BODY.includes(endpoint.method) && (
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">
                Request body (JSON)
              </span>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={9}
                className="dev-input mt-1 resize-y leading-relaxed"
                spellCheck={false}
              />
            </label>
          )}

          {endpoint.auth && !token && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              Authenticated endpoint — get a token with Demo JWT first.
            </p>
          )}

          <button
            type="button"
            onClick={send}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fm-teal px-5 py-3 font-bold text-white shadow-md shadow-fm-teal/20 transition hover:bg-fm-teal-hover disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
            Send request
          </button>

          <details className="group text-sm">
            <summary className="cursor-pointer font-bold text-fm-teal-dark">cURL</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-fm-gray-dark p-3 font-mono text-[11px] leading-relaxed text-fm-cream">
              {curlPreview}
            </pre>
          </details>
        </div>

        <div className="flex min-h-[320px] flex-col bg-fm-gray-dark/95 p-5 sm:p-6 lg:min-h-[480px]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/50">Response</h3>
            {result && !result.networkError && (
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                  result.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                {result.status} · {result.durationMs}ms
              </span>
            )}
          </div>

          {!result && (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-white/40">
              <Play size={32} className="mb-3 opacity-30" />
              <p>Try <strong className="text-white/70">GET /api/health</strong></p>
              <p className="mt-1">or click <strong className="text-white/70">Demo JWT</strong></p>
            </div>
          )}

          {result?.networkError && (
            <div className="mt-4 rounded-lg border border-red-400/30 bg-red-950/50 p-4 text-sm text-red-200">
              <p className="font-bold text-red-100">Request failed</p>
              <p className="mt-1">{result.message}</p>
              {result.url && (
                <p className="mt-2 break-all font-mono text-xs text-red-200/70">{result.url}</p>
              )}
              <p className="mt-3 text-xs text-red-200/80">
                Start API: <code>cd api && bin/dev</code>
                {!usesProxy && (
                  <>
                    {" "}
                    · Add this origin to <code>CORS_ORIGINS</code> in api/.env
                  </>
                )}
              </p>
            </div>
          )}

          {result && !result.networkError && (
            <div className="mt-3 min-h-0 flex-1 overflow-hidden">
              <p className="mb-2 break-all font-mono text-[10px] text-white/35">{result.url}</p>
              <div className="max-h-[min(60vh,520px)] overflow-auto rounded-lg border border-white/10">
                <CodeBlock code={result.data ?? "(empty body)"} variant="response" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
