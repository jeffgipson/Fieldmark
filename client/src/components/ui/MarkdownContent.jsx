import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const COLLAPSE_CHAR_THRESHOLD = 1_600;
const COLLAPSED_MAX_HEIGHT = "18rem";

const buildComponents = (compact) => ({
  h1: ({ children }) => (
    <h3 className="font-display mt-4 mb-2 text-lg font-semibold text-fm-ink first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="font-display mt-3 mb-1.5 text-base font-semibold text-fm-ink first:mt-0">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="font-display mt-2 mb-1 text-sm font-semibold text-fm-ink first:mt-0">{children}</h5>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-fm-ink">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-fm-teal/40 pl-3 text-fm-gray-medium italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-fm-gray-light" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-fm-teal underline decoration-fm-teal/40 underline-offset-2 hover:text-fm-teal-hover"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-3 -mx-1 max-w-full overflow-x-auto rounded-lg border border-fm-gray-light bg-white/60">
      <table className={`w-full min-w-full border-collapse text-left ${compact ? "text-xs" : "text-sm"}`}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-fm-gray-light bg-fm-teal-subtle">{children}</thead>,
  th: ({ children }) => (
    <th
      className={`whitespace-nowrap px-2 py-2 font-display font-semibold uppercase tracking-wide text-fm-ink ${compact ? "text-[0.65rem]" : "text-xs"}`}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className={`whitespace-nowrap border-t border-fm-gray-light/80 px-2 py-2 align-top ${compact ? "text-xs" : ""}`}>
      {children}
    </td>
  ),
  tr: ({ children }) => <tr className="even:bg-fm-cream/50">{children}</tr>,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-2 overflow-x-auto rounded-lg bg-fm-gray-dark/5 p-3 text-sm">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-fm-gray-light/80 px-1 py-0.5 font-mono text-sm text-fm-ink">{children}</code>
    );
  }
});

function MarkdownBody({ content, className = "", compact = false }) {
  if (!content?.trim()) return null;

  return (
    <div className={`dale-markdown text-base ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(compact)}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function MarkdownContent({
  content,
  collapsible = false,
  compact = false,
  collapseThreshold = COLLAPSE_CHAR_THRESHOLD,
  className = ""
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = collapsible && content.length > collapseThreshold;

  if (!isLong) {
    return <MarkdownBody content={content} className={className} compact={compact} />;
  }

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: expanded ? "none" : COLLAPSED_MAX_HEIGHT }}
      >
        <MarkdownBody content={content} compact={compact} />
        {!expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-fm-cream via-fm-cream/90 to-transparent"
            aria-hidden
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm font-medium text-fm-teal hover:text-fm-teal-hover hover:underline"
      >
        {expanded ? "Show less" : "Show full response"}
      </button>
    </div>
  );
}
