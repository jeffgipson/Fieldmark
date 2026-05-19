import { Link } from "react-router-dom";
import { BarChart2, MessageCircle, TrendingDown } from "lucide-react";
import { BRAND } from "../constants/brand";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import DaleAvatar from "../components/dale/DaleAvatar";

const STATS = [
  { label: "Corn operating (MU 2026)", value: "$600", unit: "/ac" },
  { label: "Soy operating (MU 2026)", value: "$388", unit: "/ac" },
  { label: "Planning season", value: "2026", unit: "" }
];

export default function LandingPage() {
  return (
    <div className="fm-canvas min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo size="lg" />
        <Link to="/login">
          <Button variant="secondary" className="!px-5 !py-2.5">
            Sign in
          </Button>
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pt-12">
        <div>
          <p className="fm-eyebrow">Independent farm financial planning</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight tracking-tight text-fm-ink md:text-5xl lg:text-[3.25rem]">
            {BRAND.tagline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-fm-charcoal">
            Mid-scale farmers commit $50,000–$100,000 in input costs without independent data.
            Fieldmark shows where you stand against regional peers before March.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/register">
              <Button>Start free — 30 days</Button>
            </Link>
            <Link to="/login" className="font-bold text-fm-teal hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="fm-panel p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-fm-gray-medium">
            Regional reference (MU Extension)
          </p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-fm-charcoal">{stat.label}</dt>
                <dd className="fm-stat mt-1 text-2xl font-bold text-fm-teal">
                  {stat.value}
                  <span className="text-base font-semibold text-fm-gray-medium">{stat.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-fm-gray-light pt-4 text-sm text-fm-gray-medium">
            {BRAND.attribution.benchmark}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-10">
        <h2 className="font-display text-2xl font-semibold text-fm-ink">
          What you get before March
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              Icon: BarChart2,
              title: "Peer benchmarking",
              text: "Compare your per-acre costs to similar farms in your region.",
              showDale: false
            },
            {
              Icon: TrendingDown,
              title: "Scenario modeling",
              text: "Model base case and downside margins before you commit capital.",
              showDale: false
            },
            {
              Icon: MessageCircle,
              title: "Talk to Dale",
              text: "Your independent analyst inside the app — numbers first, no vendor ties.",
              showDale: true
            }
          ].map(({ Icon, title, text, showDale }) => (
            <article key={title} className="fm-card p-6">
              {showDale ? (
                <DaleAvatar variant="avatar" size="sm" className="!items-start" />
              ) : (
                <span className="fm-icon-ring">
                  <Icon size={22} strokeWidth={2} />
                </span>
              )}
              <h3 className="font-display mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-fm-charcoal leading-relaxed">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
