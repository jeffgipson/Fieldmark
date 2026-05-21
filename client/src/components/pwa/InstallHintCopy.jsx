import { Share } from "lucide-react";

const LOCALHOST_APP_URL = "https://app.fieldmark.localhost/login";

/** @param {{ hint: "prompt" | "ios" | "browser-menu" | "needs-https" | "needs-trust-cert" | null, onDark?: boolean }} */
export default function InstallHintCopy({ hint, onDark = false }) {
  const textClass = onDark ? "text-white/75" : "text-fm-charcoal";
  const linkClass = onDark
    ? "font-semibold text-fm-gold hover:text-white"
    : "font-semibold text-fm-teal hover:text-fm-teal-hover";

  if (hint === "needs-https") {
    const httpsUrl = `https://${window.location.host}${window.location.pathname}`;
    return (
      <p className={`text-sm ${textClass}`}>
        Install requires HTTPS. Open{" "}
        <a href={httpsUrl} className={linkClass}>
          {httpsUrl}
        </a>
      </p>
    );
  }

  if (hint === "needs-trust-cert") {
    const onHttp = window.location.protocol === "http:";
    const httpsUrl = `https://${window.location.host}${window.location.pathname}`;

    return (
      <div className={`space-y-2 text-sm ${textClass}`}>
        {onHttp ? (
          <>
            <p>
              This page is on <strong>HTTP</strong> — Chrome will show <strong>Not Secure</strong>.
              Use HTTPS instead:
            </p>
            <p>
              <a href={httpsUrl} className={`${linkClass} break-all`}>
                {httpsUrl}
              </a>
            </p>
          </>
        ) : (
          <>
            <p>
              On <strong>.fieldmark.local</strong>, Chrome often still says <strong>Not Secure</strong>
              even with mkcert (no Certificate Transparency). The connection is encrypted, but Chrome
              hides the install icon.
            </p>
            <p>
              <strong>Use this URL instead</strong> (Chrome treats <code className="text-xs">*.localhost</code>{" "}
              as fully secure):
            </p>
            <p>
              <a href={LOCALHOST_APP_URL} className={`${linkClass} break-all`}>
                {LOCALHOST_APP_URL}
              </a>
            </p>
          </>
        )}
        {!onHttp ? (
          <p className="text-xs opacity-90">
            Or retry mkcert: <code className="text-xs">npm run setup:local-ssl</code>, quit Chrome
            (Cmd+Q), restart <code className="text-xs">npm run dev:local</code>
          </p>
        ) : null}
      </div>
    );
  }

  if (hint === "ios") {
    return (
      <p className={`text-sm ${textClass}`}>
        Tap{" "}
        <Share
          className={`inline align-text-bottom ${onDark ? "text-fm-gold" : "text-fm-teal"}`}
          size={14}
          aria-hidden
        />{" "}
        <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
      </p>
    );
  }

  if (hint === "browser-menu") {
    return (
      <p className={`text-sm ${textClass}`}>
        Use your browser&apos;s install control — the <strong>⊕</strong> or computer icon in the
        address bar, or the menu (<strong>⋮</strong> / <strong>⋯</strong>) →{" "}
        <strong>Install Fieldmark</strong> / <strong>Install app</strong>.
      </p>
    );
  }

  return (
    <p className={`text-sm ${textClass}`}>
      Add Fieldmark to your home screen for quick access in the field — works like an app.
    </p>
  );
}
