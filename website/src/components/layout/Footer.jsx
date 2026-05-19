import { BRAND } from "../../constants/brand";
import { appPath } from "../../lib/links";
import Logo from "../ui/Logo";

const FOOTER_LINKS = {
  Product: [
    { label: "Solutions", href: "#solutions" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Analyst", href: "#dale" },
    { label: "Sign Up", href: appPath("/register") }
  ],
  Account: [
    { label: "Sign In", href: appPath("/login") },
    { label: "Start Free", href: appPath("/register") }
  ]
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-fm-gray-dark text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size="sm" onDark />
            <p className="mt-4 max-w-sm text-sm">{BRAND.tagline}</p>
            <p className="mt-4 max-w-md text-xs text-white/50">{BRAND.attribution.benchmark}</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-display text-sm font-semibold text-white">{heading}</h4>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>Built for Midwest corn and soybean farmers.</p>
        </div>
      </div>
    </footer>
  );
}
