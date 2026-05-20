import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ code, language = "json", variant = "default" }) {
  const [copied, setCopied] = useState(false);
  const text = typeof code === "string" ? code : JSON.stringify(code, null, 2);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isResponse = variant === "response";

  return (
    <div className={`group relative ${isResponse ? "" : ""}`}>
      <pre
        className={
          isResponse
            ? "m-0 overflow-x-auto bg-transparent p-4 font-mono text-xs leading-relaxed text-fm-cream"
            : "overflow-x-auto rounded-lg border border-fm-gray-medium/20 bg-fm-gray-dark p-4 text-sm leading-relaxed text-fm-cream"
        }
      >
        <code className={`language-${language}`}>{text}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-white/10 bg-black/30 p-1.5 text-white/80 opacity-0 transition hover:bg-black/50 group-hover:opacity-100"
        aria-label="Copy"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
