import { APP_URLS, adminPath, developerPath, websitePath } from "../../lib/appUrls";

export default function LocalDevBar() {
  if (!import.meta.env.DEV) return null;

  const apiUrl = "http://localhost:3000";

  const links = [
    { label: "Website", href: websitePath("/"), hint: "5174" },
    { label: "Farmer app", href: "/", hint: "here" },
    { label: "API docs", href: developerPath(), hint: "docs" },
    { label: "Admin", href: adminPath("/"), hint: "5175" },
    { label: "API", href: apiUrl, hint: "3000", external: true }
  ];

  return (
    <div
      className="border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-center text-xs text-amber-950"
      role="navigation"
      aria-label="Local development shortcuts"
    >
      <span className="font-bold">Local dev</span>
      <span className="mx-2 text-amber-800/60">·</span>
      {links.map((link, i) => (
        <span key={link.label}>
          {i > 0 && <span className="mx-1.5 text-amber-800/40">|</span>}
          <a
            href={link.href}
            className="font-bold text-amber-900 underline-offset-2 hover:underline"
            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {link.label}
          </a>
          <span className="ml-0.5 font-mono text-[10px] text-amber-800/55">{link.hint}</span>
        </span>
      ))}
    </div>
  );
}
