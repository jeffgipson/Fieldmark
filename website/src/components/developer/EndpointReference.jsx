import { API_GROUPS } from "../../constants/apiCatalog";
import MethodBadge from "./MethodBadge";
import CodeBlock from "./CodeBlock";

export default function EndpointReference({ selectedId, onSelect }) {
  const endpoint = API_GROUPS.flatMap((g) => g.endpoints).find((e) => e.id === selectedId);

  return (
    <div className="dev-card overflow-hidden">
      <div className="border-b border-fm-gray-medium/15 px-5 py-5 sm:px-6">
        <h2 className="font-display text-xl font-bold text-fm-gray-dark">Endpoint reference</h2>
        <p className="mt-1 text-sm text-fm-charcoal">
          Canonical spec:{" "}
          <a
            href="https://github.com/jeffgipson/Fieldmark/blob/main/api/docs/API.md"
            className="font-bold text-fm-teal-dark underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            api/docs/API.md
          </a>
        </p>
      </div>

      {endpoint ? (
        <article className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-fm-charcoal/50">
            {API_GROUPS.find((g) => g.endpoints.some((e) => e.id === selectedId))?.label}
          </p>
          <div className="mt-2 flex flex-wrap items-start gap-3">
            <MethodBadge method={endpoint.method} />
            <code className="break-all font-mono text-sm text-fm-gray-dark">{endpoint.path}</code>
            {endpoint.auth ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                JWT required
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                Public
              </span>
            )}
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold text-fm-gray-dark">{endpoint.title}</h3>
          {endpoint.description && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fm-charcoal">{endpoint.description}</p>
          )}
          {endpoint.responseNote && (
            <p className="mt-2 text-sm text-fm-charcoal/80">{endpoint.responseNote}</p>
          )}

          {(endpoint.pathParams || []).length > 0 && (
            <ParamTable title="Path parameters" params={endpoint.pathParams} />
          )}
          {(endpoint.queryParams || []).length > 0 && (
            <ParamTable title="Query parameters" params={endpoint.queryParams} />
          )}

          {endpoint.sampleBody != null && Object.keys(endpoint.sampleBody).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-fm-gray-dark">Sample request body</h4>
              <div className="mt-2 max-w-2xl">
                <CodeBlock code={endpoint.sampleBody} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelect(endpoint.id)}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-fm-teal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fm-teal-hover"
          >
            Open in playground →
          </button>
        </article>
      ) : (
        <p className="p-6 text-sm text-fm-charcoal">Select an endpoint from the sidebar or playground.</p>
      )}
    </div>
  );
}

function ParamTable({ title, params }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-fm-gray-light">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="bg-fm-cream/80">
          <tr>
            <th className="px-4 py-2 text-xs font-bold uppercase text-fm-charcoal/55">Name</th>
            <th className="px-4 py-2 text-xs font-bold uppercase text-fm-charcoal/55">Required</th>
            <th className="px-4 py-2 text-xs font-bold uppercase text-fm-charcoal/55">Notes</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-t border-fm-gray-light">
              <td className="px-4 py-2 font-mono text-fm-teal-dark">{p.name}</td>
              <td className="px-4 py-2">{p.required ? "Yes" : "No"}</td>
              <td className="px-4 py-2 text-fm-charcoal">{p.hint || p.example || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
