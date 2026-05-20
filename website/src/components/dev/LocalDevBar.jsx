import { APP_URLS, adminPath, appPath, websitePath } from "../../lib/appUrls";

const LINKS = [
  { label: "Website", href: () => websitePath("/"), hint: "here" },
  { label: "Farmer app", href: () => appPath("/"), hint: "5173" },
  { label: "API docs", href: () => websitePath("/developer"), hint: "docs" },
  { label: "Admin", href: () => adminPath("/"), hint: "5175" },
  { label: "API", href: () => APP_URLS.api, hint: "3000", external: true }
];

export default function LocalDevBar() {
  if (!import.meta.env.DEV) return null;

  return (
    <div
      className="border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-center text-xs text-amber-950"
      role="navigation"
      aria-label="Local development shortcuts"
    >
      <span className="font-bold">Local dev</span>
      <span className="mx-2 text-amber-800/60">·</span>
      {LINKS.map((link, i) => (
        <span key={link.label}>
          {i > 0 && <span className="mx-1.5 text-amber-800/40">|</span>}
          <a
            href={link.href()}
            className="font-bold text-amber-900 underline-offset-2 hover:underline"
            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {link.label}
          </a>
          <span className="ml-0.5 font-mono text-[10px] text-amber-800/55">:{link.hint}</span>
        </span>
      ))}
    </div>
  );
}
