import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { MAIN_NAV, isHashNav, isNavItemActive } from "../../constants/nav";
import { appPath } from "../../lib/links";
import Button from "../ui/Button";
import Logo from "../ui/Logo";

function navLinkClass(active, mobile = false) {
  if (mobile) {
    return active
      ? "rounded-lg bg-white/10 px-3 py-3 font-bold text-white"
      : "rounded-lg px-3 py-3 font-bold text-white/90 hover:bg-white/5";
  }
  return active
    ? "text-sm font-bold text-white"
    : "text-sm font-bold text-white/85 transition hover:text-white";
}

function NavItem({ item, pathname, mobile, onNavigate }) {
  const active = isNavItemActive(pathname, item.to);
  const className = navLinkClass(active, mobile);

  if (isHashNav(item.to)) {
    return (
      <a href={item.to} className={className} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-white/10 bg-fm-gray-dark/95 py-3 shadow-lg backdrop-blur-md"
          : "bg-gradient-to-b from-black/50 to-transparent py-5"
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="block">
          <Logo size="lg" onDark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {MAIN_NAV.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={appPath("/login")}
            className="px-4 py-2 text-sm font-bold text-white/90 transition hover:text-white"
          >
            Sign In
          </a>
          <Button href={appPath("/register")} className="!py-2.5 !px-5 !text-sm">
            Start Free
          </Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-white md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-fm-gray-dark md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            {MAIN_NAV.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                pathname={pathname}
                mobile
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
            <hr className="my-2 border-white/10" />
            <a href={appPath("/login")} className="px-3 py-3 font-bold text-white/90">
              Sign In
            </a>
            <Button href={appPath("/register")} className="mt-2 w-full justify-center">
              Start Free
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
