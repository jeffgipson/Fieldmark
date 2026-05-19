import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { appPath } from "../../lib/links";
import Button from "../ui/Button";
import Logo from "../ui/Logo";

const NAV = [
  { label: "Solutions", href: "#solutions" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Analyst", href: "#dale" },
  { label: "Farmers", href: "#stories" }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        scrolled
          ? "border-b border-white/10 bg-fm-gray-dark/95 py-3 shadow-lg backdrop-blur-md"
          : "bg-gradient-to-b from-black/50 to-transparent py-5"
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          <a href="#" className="block">
            <Logo size="lg" onDark />
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-white/85 transition hover:text-white"
              >
                {item.label}
              </a>
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
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 font-bold text-white/90 hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
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
