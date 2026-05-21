import { Download } from "lucide-react";
import { BRAND } from "../../constants/brand";
import usePwaInstall from "../../hooks/usePwaInstall";
import InstallHintCopy from "./InstallHintCopy";

export default function InstallAppMenuItem({ variant = "sidebar" }) {
  const { canPromptInstall, installHint, showInstallAction, install, clearBannerDismiss } =
    usePwaInstall();
  const onLight = variant === "light";

  if (!showInstallAction || !installHint) {
    return null;
  }

  return (
    <div
      className={
        onLight
          ? "rounded-xl border border-fm-gray-light bg-fm-teal-subtle/40 px-3 py-3"
          : "mb-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
      }
    >
      <div
        className={`flex items-center gap-2 text-sm font-medium ${onLight ? "text-fm-charcoal" : "text-white"}`}
      >
        <Download
          size={18}
          strokeWidth={2}
          className={`shrink-0 ${onLight ? "text-fm-teal" : "text-fm-gold"}`}
          aria-hidden
        />
        <span className={onLight ? "" : "sidebar-label"}>Install {BRAND.name}</span>
      </div>
      <div
        className={`mt-2 text-xs leading-relaxed ${onLight ? "text-fm-gray-medium" : "sidebar-label text-white/70"}`}
      >
        <InstallHintCopy hint={installHint} onDark={!onLight} />
      </div>
      {canPromptInstall ? (
        <button
          type="button"
          onClick={() => install()}
          className={`mt-3 w-full rounded-lg bg-fm-teal px-3 py-2 text-sm font-semibold text-white hover:bg-fm-teal-hover ${onLight ? "" : "sidebar-label"}`}
        >
          Install app
        </button>
      ) : (
        <button
          type="button"
          onClick={clearBannerDismiss}
          className={`mt-2 text-xs font-medium ${onLight ? "text-fm-teal hover:underline" : "sidebar-label text-fm-gold hover:text-white"}`}
        >
          Show install reminder again
        </button>
      )}
    </div>
  );
}
