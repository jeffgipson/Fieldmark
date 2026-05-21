import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, ChevronRight, Terminal } from "lucide-react";
import DocsHeader from "../components/layout/DocsHeader";
import DocsFooter from "../components/layout/DocsFooter";
import CodeBlock from "../components/developer/CodeBlock";
import {
  MCP_CLI_EXAMPLES,
  MCP_CONFIG_EXAMPLE,
  MCP_ENV_VARS,
  MCP_INSTALL_STEPS,
  MCP_TOOLS
} from "../constants/mcpTools";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "install", label: "Install" },
  { id: "configuration", label: "Configuration" },
  { id: "cursor", label: "Cursor setup" },
  { id: "tools", label: "MCP tools" },
  { id: "cli", label: "CLI" }
];

const NPM_SCRIPTS = [
  { command: "npm run build", description: "Compile TypeScript to dist/" },
  { command: "npm run dev:cli", description: "Run CLI via tsx (no global link)" },
  { command: "npm run dev:mcp", description: "Run MCP server via tsx for local debugging" }
];

export default function DeveloperMcpPage() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    document.title = "Fieldmark MCP — Developer docs";
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

  return (
    <div className="dev-shell">
      <DocsHeader variant="mcp" />

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
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-fm-charcoal/50">
              Related
            </p>
            <nav className="dev-sidebar-nav mt-2 space-y-0.5">
              <Link to="/developer" className="flex items-center gap-1 text-sm">
                REST API docs <ChevronRight size={14} />
              </Link>
              <a href="/llm.txt" target="_blank" rel="noopener noreferrer" className="text-sm">
                llm.txt
              </a>
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-16">
          <section id="overview" className="scroll-mt-24">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-fm-teal text-white shadow-lg shadow-fm-teal/25">
                <Bot size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-fm-teal-dark">
                  Model Context Protocol
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-fm-gray-dark sm:text-4xl">
                  Fieldmark MCP server
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-fm-charcoal">
                  Connect Cursor and other AI assistants to the live Fieldmark API — farms, MU Extension
                  benchmarks, margin scenarios, Dale (AI analyst), lender reports, and decisions. Package
                  lives in <code className="rounded bg-fm-gray-light px-1 font-mono text-xs">tools/fieldmark</code>.
                </p>
              </div>
            </div>

            <div className="mt-8 dev-card p-6">
              <h2 className="font-display text-lg font-bold text-fm-gray-dark">Prerequisites</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-fm-charcoal">
                <li>Node.js 20+</li>
                <li>
                  Fieldmark API running locally:{" "}
                  <code className="font-mono text-xs">cd api && bin/rails server</code> (or{" "}
                  <code className="font-mono text-xs">bin/dev</code> from repo root)
                </li>
                <li>
                  A JWT from{" "}
                  <Link to="/developer#playground" className="font-bold text-fm-teal-dark hover:underline">
                    demo login in the API playground
                  </Link>
                  , <code className="font-mono text-xs">fieldmark auth login</code>, or the farmer app
                </li>
              </ul>
              <p className="mt-4 rounded-lg bg-fm-teal/8 px-3 py-2 text-sm text-fm-charcoal">
                <strong className="text-fm-teal-dark">Tip:</strong> For agents, prefer MCP over expanding{" "}
                <a href="/llm.txt" className="font-bold text-fm-teal-dark hover:underline">
                  llm.txt
                </a>{" "}
                — tools call the API with your token and return structured results.
              </p>
            </div>
          </section>

          <section id="install" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-fm-gray-dark">Install &amp; build</h2>
            <p className="mt-2 max-w-2xl text-sm text-fm-charcoal">
              From the Fieldmark repo root, build the TypeScript package once (or after pulling updates).
            </p>
            <div className="mt-6">
              <CodeBlock
                code={MCP_INSTALL_STEPS.join("\n")}
                language="bash"
              />
            </div>
            <p className="mt-4 text-sm text-fm-charcoal">
              Optional: link the CLI globally with <code className="font-mono text-xs">npm link</code> inside{" "}
              <code className="font-mono text-xs">tools/fieldmark</code>, then run{" "}
              <code className="font-mono text-xs">fieldmark</code> from anywhere.
            </p>
          </section>

          <section id="configuration" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-fm-gray-dark">Configuration</h2>
            <p className="mt-2 max-w-2xl text-sm text-fm-charcoal">
              Credentials are stored in <code className="font-mono text-xs">~/.fieldmark/config.json</code> after{" "}
              <code className="font-mono text-xs">fieldmark auth login</code>, or set via environment variables
              in <code className="font-mono text-xs">.cursor/mcp.json</code>.
            </p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-fm-gray-medium/20">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-fm-gray-medium/20 bg-fm-cream/80">
                    <th className="px-4 py-3 font-bold text-fm-gray-dark">Variable</th>
                    <th className="px-4 py-3 font-bold text-fm-gray-dark">Description</th>
                    <th className="px-4 py-3 font-bold text-fm-gray-dark">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {MCP_ENV_VARS.map((row) => (
                    <tr key={row.name} className="border-b border-fm-gray-light/80">
                      <td className="px-4 py-3 font-mono text-xs text-fm-teal-dark">{row.name}</td>
                      <td className="px-4 py-3 text-fm-charcoal">{row.description}</td>
                      <td className="px-4 py-3 font-mono text-xs text-fm-charcoal/70">
                        {row.default ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-fm-charcoal">
              After <code className="font-mono text-xs">fieldmark auth login</code>, copy{" "}
              <code className="font-mono text-xs">token</code> from{" "}
              <code className="font-mono text-xs">~/.fieldmark/config.json</code> into{" "}
              <code className="font-mono text-xs">FIELDMARK_TOKEN</code>.
            </p>
          </section>

          <section id="cursor" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-fm-gray-dark">Cursor setup</h2>
            <p className="mt-2 max-w-2xl text-sm text-fm-charcoal">
              Add the server to <code className="font-mono text-xs">.cursor/mcp.json</code> in the project root
              (or Cursor user MCP settings). Use an <strong>absolute path</strong> to{" "}
              <code className="font-mono text-xs">dist/mcp-server.js</code> on your machine.
            </p>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-fm-charcoal">
              <li>
                Run <code className="font-mono text-xs">cd tools/fieldmark && npm run build</code>
              </li>
              <li>Start the API (default <code className="font-mono text-xs">http://localhost:3000</code>)</li>
              <li>Obtain a JWT (playground demo, CLI login, or app sign-in)</li>
              <li>Paste the config below and restart Cursor (or reload MCP servers)</li>
            </ol>
            <div className="mt-6">
              <CodeBlock code={MCP_CONFIG_EXAMPLE} language="json" />
            </div>
            <p className="mt-4 text-sm text-fm-charcoal">
              Development without a global link:{" "}
              <code className="font-mono text-xs">npm run dev:mcp</code> runs the server via tsx for debugging.
            </p>
          </section>

          <section id="tools" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-fm-gray-dark">MCP tools</h2>
            <p className="mt-2 text-sm text-fm-charcoal">
              {MCP_TOOLS.length} tools registered with the MCP server (keep in sync with{" "}
              <code className="font-mono text-xs">tools/fieldmark/src/mcp-server.ts</code>).
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {MCP_TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="dev-card px-4 py-3"
                >
                  <p className="font-mono text-xs font-bold text-fm-teal-dark">{tool.name}</p>
                  <p className="mt-1 text-sm text-fm-charcoal">{tool.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="cli" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fm-gray-dark text-white">
                <Terminal size={20} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-fm-gray-dark">CLI reference</h2>
                <p className="text-sm text-fm-charcoal">
                  Same package as the MCP server — useful for scripts and quick checks.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <CodeBlock code={MCP_CLI_EXAMPLES} language="bash" />
            </div>
            <p className="mt-4 text-sm text-fm-charcoal">
              Without <code className="font-mono text-xs">npm link</code>:{" "}
              <code className="font-mono text-xs">npm run dev:cli -- health</code> and{" "}
              <code className="font-mono text-xs">npm run dev:cli -- auth login -e you@example.com -p ...</code>
            </p>
            <h3 className="mt-8 font-display text-lg font-bold text-fm-gray-dark">npm scripts</h3>
            <ul className="mt-3 space-y-2">
              {NPM_SCRIPTS.map((row) => (
                <li
                  key={row.command}
                  className="flex flex-wrap items-baseline gap-2 rounded-lg border border-fm-gray-light bg-fm-cream/50 px-3 py-2.5 text-sm"
                >
                  <code className="font-mono text-xs font-bold text-fm-teal-dark">{row.command}</code>
                  <span className="text-fm-charcoal">{row.description}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <DocsFooter />
    </div>
  );
}
