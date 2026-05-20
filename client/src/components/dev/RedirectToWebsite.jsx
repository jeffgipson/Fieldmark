import { useEffect } from "react";
import { websitePath } from "../../lib/appUrls";

/** Farmer app routes that belong on the public website (homepage, API docs). */
export default function RedirectToWebsite({ path = "/" }) {
  const href = websitePath(path);
  const isHome = path === "/" || path === "";
  const label = isHome
    ? "Continue to Fieldmark website"
    : "Continue to developer docs";

  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <p className="p-8 text-center text-sm text-fm-charcoal">
      {isHome
        ? "The public site (pricing, product overview) runs separately from the farmer app."
        : "API docs are on the Fieldmark website."}{" "}
      <a href={href} className="font-bold text-fm-teal underline-offset-2 hover:underline">
        {label}
      </a>
    </p>
  );
}
