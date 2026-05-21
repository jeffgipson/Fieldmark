import { Download, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BRAND } from "../../constants/brand";
import usePwaInstall from "../../hooks/usePwaInstall";
import InstallHintCopy from "./InstallHintCopy";

const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

export default function InstallBanner() {
  const location = useLocation();
  const {
    canPromptInstall,
    installHint,
    showBanner,
    dismissBanner,
    install
  } = usePwaInstall();

  if (!showBanner || !installHint) {
    return null;
  }

  const aboveMobileNav = !AUTH_ROUTES.has(location.pathname);

  return (
    <div
      role="region"
      aria-label="Install Fieldmark app"
      className={`fixed left-4 right-4 z-[60] mx-auto max-w-lg rounded-xl border border-fm-teal/25 bg-white p-4 shadow-lg sm:left-auto sm:right-6 lg:bottom-4 ${
        aboveMobileNav
          ? "max-lg:bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]"
          : "max-lg:bottom-[max(1rem,env(safe-area-inset-bottom,0px))]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fm-teal/10">
          <Download className="text-fm-teal" size={20} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-fm-gray-dark">
            Install {BRAND.name}
          </p>
          <div className="mt-1">
            <InstallHintCopy hint={installHint} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {canPromptInstall ? (
              <button
                type="button"
                onClick={() => install()}
                className="rounded-lg bg-fm-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-fm-teal-hover"
              >
                Install
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismissBanner}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fm-gray-medium hover:text-fm-charcoal"
            >
              {canPromptInstall ? "Not now" : "Got it"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissBanner}
          className="shrink-0 rounded-lg p-1 text-fm-gray-medium hover:bg-fm-gray-light hover:text-fm-charcoal"
          aria-label="Dismiss install prompt"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
