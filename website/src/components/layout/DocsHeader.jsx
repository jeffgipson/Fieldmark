import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { appPath } from "../../lib/links";
import Logo from "../ui/Logo";

const SECTIONS = [
  { label: "Overview", href: "#overview" },
  { label: "Playground", href: "#playground" },
  { label: "Reference", href: "#reference" },
  { label: "MCP & llm.txt", href: "#integrations" }
];

export default function DocsHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-fm-gray-medium/15 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="dev-logo-header shrink-0" title="Marketing home">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-fm-charcoal transition hover:bg-fm-teal/10 hover:text-fm-teal-dark"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            to="/developer"
            className={`rounded-lg px-3 py-2 text-sm font-bold ${
              pathname === "/developer" ? "text-fm-teal-dark" : "text-fm-charcoal hover:text-fm-teal-dark"
            }`}
          >
            API
          </Link>
          <Link
            to={appPath("/login")}
            className="rounded-lg px-3 py-2 text-sm font-bold text-fm-charcoal hover:bg-fm-gray-light"
          >
            Sign in
          </Link>
          <Link
            to={appPath("/register")}
            className="rounded-lg bg-fm-teal px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-fm-teal-hover"
          >
            Start free
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-fm-gray-dark md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-fm-gray-medium/15 px-4 py-3 md:hidden">
          {SECTIONS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-fm-charcoal hover:bg-fm-gray-light"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <hr className="my-2 border-fm-gray-medium/15" />
          <Link
            to={appPath("/login")}
            className="block px-3 py-2 text-sm font-bold"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
