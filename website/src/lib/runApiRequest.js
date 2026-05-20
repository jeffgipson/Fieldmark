/**
 * Build URL from path template and param maps.
 */
export function buildPath(template, pathParams = {}) {
  return template.replace(/:(\w+)/g, (_, key) => {
    const value = pathParams[key];
    if (value === undefined || value === "") return `:${key}`;
    return encodeURIComponent(String(value));
  });
}

export function buildUrl(baseUrl, path, queryParams = {}) {
  const trimmed = (baseUrl || "").replace(/\/$/, "");
  const base =
    trimmed ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

/**
 * Execute an API request from playground state.
 */
export async function runApiRequest({
  baseUrl,
  method,
  pathTemplate,
  pathParams = {},
  queryParams = {},
  body,
  token,
  authRequired
}) {
  const path = buildPath(pathTemplate, pathParams);
  if (path.includes(":")) {
    throw new Error("Fill in all path parameters (e.g. farm_id) before sending.");
  }

  const url = buildUrl(baseUrl, path, queryParams);
  const headers = { Accept: "application/json" };

  const methodsWithBody = ["POST", "PUT", "PATCH"];
  const hasBody = body != null && methodsWithBody.includes(method);
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const started = performance.now();
  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    return {
      ok: false,
      networkError: true,
      message: err instanceof Error ? err.message : String(err),
      durationMs: Math.round(performance.now() - started),
      url
    };
  }

  const durationMs = Math.round(performance.now() - started);
  const contentType = response.headers.get("content-type") || "";
  let parsed = null;
  let rawText = "";

  try {
    rawText = await response.text();
    if (contentType.includes("application/json") && rawText) {
      parsed = JSON.parse(rawText);
    } else if (rawText) {
      parsed = rawText;
    }
  } catch {
    parsed = rawText || null;
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    durationMs,
    url,
    headers: Object.fromEntries(response.headers.entries()),
    data: parsed
  };
}
