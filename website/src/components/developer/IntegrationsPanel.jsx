import { Bot, ExternalLink, FileText, Terminal } from "lucide-react";
import { MCP_CONFIG_EXAMPLE, MCP_TOOLS } from "../../constants/mcpTools";
import CodeBlock from "./CodeBlock";

export default function IntegrationsPanel() {
  const llmUrl = `${window.location.origin}/llm.txt`;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-fm-gray-dark">AI &amp; tooling</h2>
      <p className="mt-2 max-w-2xl text-fm-charcoal">
        Point LLMs at <code className="rounded bg-white px-1.5 py-0.5 font-mono text-sm">llm.txt</code> or
        connect Cursor via the Fieldmark MCP server.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="dev-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fm-teal/15 text-fm-teal">
              <FileText size={22} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-fm-gray-dark">llm.txt</h3>
              <p className="text-xs text-fm-charcoal/70">Machine-readable project context</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-fm-charcoal">
            Repo layout, local URLs, auth, client flow, async reports, key endpoints, and doc links — optimized for agents.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/llm.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-fm-teal px-4 py-2 text-sm font-bold text-white hover:bg-fm-teal-hover"
            >
              View llm.txt <ExternalLink size={14} />
            </a>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] text-fm-charcoal/50">{llmUrl}</p>
        </div>

        <div className="dev-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fm-teal/15 text-fm-teal">
              <Bot size={22} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-fm-gray-dark">MCP server</h3>
              <p className="text-xs text-fm-charcoal/70">tools/fieldmark</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-fm-charcoal">
            {MCP_TOOLS.length} tools: farms, benchmarks, scenarios, analyst Q&amp;A, reports, decisions.
          </p>
          <a
            href="https://github.com/jeffgipson/Fieldmark/blob/main/tools/fieldmark/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-fm-teal-dark hover:underline"
          >
            MCP setup guide <ExternalLink size={14} />
          </a>
          <ul className="mt-4 grid max-h-36 gap-1 overflow-y-auto font-mono text-[11px] text-fm-charcoal sm:grid-cols-2">
            {MCP_TOOLS.map((t) => (
              <li key={t.name} className="truncate rounded bg-fm-cream/80 px-2 py-1" title={t.description}>
                {t.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="dev-card p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fm-gray-dark text-white">
              <Terminal size={22} />
            </span>
            <h3 className="font-display text-lg font-bold text-fm-gray-dark">Cursor · mcp.json</h3>
          </div>
          <p className="mt-3 text-sm text-fm-charcoal">
            <code className="rounded bg-fm-gray-light px-1 font-mono text-xs">cd tools/fieldmark && npm run build</code>
            , then add to <code className="font-mono text-xs">.cursor/mcp.json</code>. Use{" "}
            <strong>Demo JWT</strong> above or <code className="font-mono text-xs">fieldmark auth login</code>.
          </p>
          <div className="mt-4">
            <CodeBlock code={MCP_CONFIG_EXAMPLE} language="json" />
          </div>
        </div>
      </div>
    </div>
  );
}
