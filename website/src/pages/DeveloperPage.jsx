import { useCallback, useEffect, useState } from "react";
import { BookOpen, Terminal } from "lucide-react";
import DocsHeader from "../components/layout/DocsHeader";
import DocsFooter from "../components/layout/DocsFooter";
import ApiPlayground from "../components/developer/ApiPlayground";
import EndpointReference from "../components/developer/EndpointReference";
import IntegrationsPanel from "../components/developer/IntegrationsPanel";
import CodeBlock from "../components/developer/CodeBlock";
import { API_GROUPS, DEFAULT_ENDPOINT_ID } from "../constants/apiCatalog";
import { getBaseUrl } from "../lib/playgroundStorage";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "playground", label: "Playground" },
  { id: "reference", label: "Reference" },
  { id: "integrations", label: "MCP & llm.txt" }
];

const ENVELOPE_SUCCESS = {
  data: { status: "ok" },
  meta: {},
  errors: []
};

const ENVELOPE_ERROR = {
  data: null,
  meta: {},
  errors: [{ field: "email", message: "has already been taken" }]
};

const FLOW_STEPS = [
  { method: "POST", path: "/api/v1/auth/demo", note: "or register / login" },
  { method: "GET", path: "/api/v1/farms" },
  { method: "POST", path: "/api/v1/farms/:farm_id/fields" },
  { method: "POST", path: "/api/v1/fields/:field_id/input_costs" },
  { method: "GET", path: "/api/v1/benchmarks?region=central&commodity=corn&year=2026" },
  { method: "POST", path: "/api/v1/farms/:farm_id/scenarios" },
  { method: "POST", path: "/api/v1/farms/:farm_id/scenarios/:id/calculate" },
  { method: "POST", path: "/api/v1/farms/:farm_id/scenarios/:id/compare" },
  { method: "POST", path: "/api/v1/conversations" },
  { method: "POST", path: "/api/v1/scenarios/:id/report" }
];

export default function DeveloperPage() {
  const [selectedId, setSelectedId] = useState(DEFAULT_ENDPOINT_ID);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    document.title = "Fieldmark API — Developer docs";
    return () => {
      document.title = "Fieldmark — Know your margins before March";
    };
  }, []);

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToPlayground = useCallback((id) => {
    if (id) setSelectedId(id);
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const baseUrl = getBaseUrl();

  return (
    <div className="dev-shell">
      <DocsHeader />

      <div className="dev-layout">
        <aside className="dev-sidebar">
          <div className="dev-sidebar-top">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-fm-charcoal/50">
              On this page
            </p>
            <nav className="dev-sidebar-nav space-y-0.5">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={activeSection === s.id ? "is-active" : ""}
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="dev-sidebar-endpoints">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-fm-charcoal/50">
              Endpoints
            </p>
            <nav className="space-y-4 pb-4 text-xs">
            {API_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="font-bold uppercase tracking-wide text-fm-charcoal/45">{group.label}</p>
                <ul className="mt-1 space-y-0.5">
                  {group.endpoints.map((ep) => (
                    <li key={ep.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(ep.id);
                          scrollToPlayground(ep.id);
                        }}
                        className={[
                          "w-full rounded px-2 py-1 text-left font-mono transition",
                          selectedId === ep.id
                            ? "bg-fm-teal/15 font-bold text-fm-teal-dark"
                            : "text-fm-charcoal hover:bg-white/80"
                        ].join(" ")}
                      >
                        <span className="text-[10px] font-bold">{ep.method}</span> {ep.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-16">
          <section id="overview" className="scroll-mt-24">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-fm-teal text-white shadow-lg shadow-fm-teal/25">
                <Terminal size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-fm-teal-dark">
                  REST API · v1
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-fm-gray-dark sm:text-4xl">
                  Fieldmark Developer
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-fm-charcoal">
                  Independent benchmarks, margin scenarios, peer comparison, and Dale (AI analyst).
                  All responses use a JSON envelope; authenticate with a JWT from login or demo.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <SpecCard label="Base URL" value={baseUrl} mono />
              <SpecCard label="Content-Type" value="application/json" />
              <SpecCard label="Authorization" value="Bearer <jwt>" mono />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="dev-card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-fm-gray-dark">
                  <BookOpen size={20} className="text-fm-teal" />
                  Response envelope
                </h2>
                <p className="mt-2 text-sm text-fm-charcoal">
                  Every endpoint returns <code className="rounded bg-fm-gray-light px-1 font-mono text-xs">data</code>,{" "}
                  <code className="rounded bg-fm-gray-light px-1 font-mono text-xs">meta</code>, and{" "}
                  <code className="rounded bg-fm-gray-light px-1 font-mono text-xs">errors</code>.
                </p>
                <p className="mt-4 text-xs font-bold uppercase text-fm-charcoal/55">Success</p>
                <div className="mt-2">
                  <CodeBlock code={ENVELOPE_SUCCESS} />
                </div>
                <p className="mt-4 text-xs font-bold uppercase text-fm-charcoal/55">Validation error</p>
                <div className="mt-2">
                  <CodeBlock code={ENVELOPE_ERROR} />
                </div>
              </div>

              <div className="dev-card p-6">
                <h2 className="font-display text-lg font-bold text-fm-gray-dark">Quick start flow</h2>
                <ol className="mt-4 space-y-2">
                  {FLOW_STEPS.map((step, i) => (
                    <li
                      key={step.path}
                      className="flex gap-3 rounded-lg border border-fm-gray-light bg-fm-cream/50 px-3 py-2.5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fm-teal text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 font-mono text-xs sm:text-sm">
                        <span className="font-bold text-fm-teal-dark">{step.method}</span>{" "}
                        <span className="break-all text-fm-gray-dark">{step.path}</span>
                        {step.note && (
                          <span className="mt-0.5 block text-fm-charcoal/70">{step.note}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 rounded-lg bg-fm-teal/8 px-3 py-2 text-sm text-fm-charcoal">
                  <strong className="text-fm-teal-dark">Local:</strong>{" "}
                  <code className="font-mono text-xs">cd api && bin/dev</code> · Demo seed:{" "}
                  <code className="font-mono text-xs">bin/rails demo:seed</code>
                </p>
              </div>
            </div>
          </section>

          <section id="playground" className="scroll-mt-24">
            <ApiPlayground selectedId={selectedId} onSelectEndpoint={setSelectedId} />
          </section>

          <section id="reference" className="scroll-mt-24">
            <EndpointReference
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                scrollToPlayground(id);
              }}
            />
          </section>

          <section id="integrations" className="scroll-mt-24">
            <IntegrationsPanel />
          </section>
        </div>
      </div>

      <DocsFooter />
    </div>
  );
}

function SpecCard({ label, value, mono }) {
  return (
    <div className="dev-card px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-fm-charcoal/55">{label}</p>
      <p
        className={`mt-1 text-sm text-fm-gray-dark ${mono ? "break-all font-mono text-xs leading-relaxed" : "font-bold"}`}
      >
        {value}
      </p>
    </div>
  );
}
