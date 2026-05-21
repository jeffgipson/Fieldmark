import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "fieldmark-pwa-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isApple = /iphone|ipad|ipod/i.test(ua);
  const isWebkit = /webkit/i.test(ua);
  const isChrome = /crios|chrome/i.test(ua);
  return isApple && isWebkit && !isChrome;
}

function isChromium() {
  const ua = window.navigator.userAgent;
  return /chrome|chromium|crios|edg/i.test(ua) && !/firefox|fxios/i.test(ua);
}

function isLocalFieldmarkHost() {
  return /\.fieldmark\.local(host)?$/i.test(window.location.hostname);
}

/** Chrome treats *.localhost as a secure context (lock icon, PWA install). */
function isLocalhostDevHost() {
  return /\.localhost$/i.test(window.location.hostname);
}

function needsHttpsForInstall() {
  if (window.isSecureContext) return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

/** On *.fieldmark.local (not .localhost) without install prompt. */
function needsTrustLocalCert(deferredPrompt) {
  if (deferredPrompt) return false;
  if (!isLocalFieldmarkHost() || isLocalhostDevHost()) return false;
  if (window.location.protocol === "http:") return true;
  return window.location.protocol === "https:";
}

function canShowBrowserMenuHint() {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || isLocalhostDevHost()) {
    return isChromium();
  }
  if (isLocalFieldmarkHost()) return false;
  return window.isSecureContext && isChromium();
}

/**
 * How to guide the user when the native prompt is not available.
 * @returns {"prompt" | "ios" | "browser-menu" | "needs-https" | "needs-trust-cert" | null}
 */
export function getInstallHint(deferredPrompt) {
  if (isStandalone()) return null;
  if (needsHttpsForInstall()) return "needs-https";
  if (deferredPrompt) return "prompt";
  if (needsTrustLocalCert(deferredPrompt)) return "needs-trust-cert";
  if (isIosSafari()) return "ios";
  if (canShowBrowserMenuHint()) return "browser-menu";
  return null;
}

/**
 * @returns {{
 *   canPromptInstall: boolean,
 *   installHint: ReturnType<typeof getInstallHint>,
 *   installed: boolean,
 *   bannerDismissed: boolean,
 *   dismissBanner: () => void,
 *   clearBannerDismiss: () => void,
 *   install: () => Promise<boolean>,
 *   showBanner: boolean,
 *   showInstallAction: boolean
 * }}
 */
export default function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1"
  );

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return undefined;
    }

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setBannerDismissed(true);
  }, []);

  const clearBannerDismiss = useCallback(() => {
    localStorage.removeItem(DISMISS_KEY);
    setBannerDismissed(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const installHint = getInstallHint(deferredPrompt);
  const canPromptInstall = Boolean(deferredPrompt) && !installed;
  const showInstallAction = !installed && installHint !== null;
  const showBanner = showInstallAction && !bannerDismissed;

  return {
    canPromptInstall,
    installHint,
    installed,
    bannerDismissed,
    dismissBanner,
    clearBannerDismiss,
    install,
    showBanner,
    showInstallAction
  };
}
