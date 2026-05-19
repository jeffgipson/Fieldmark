import { BarChart2, MessageCircle, SlidersHorizontal, TrendingDown } from "lucide-react";
import { appPath } from "../../lib/links";
import Button from "../ui/Button";

const SOLUTIONS = [
  {
    Icon: BarChart2,
    title: "Cost Comparison",
    description:
      "Enter your per-field input costs and see how seed, fertilizer, and chemicals stack up — line by line, per acre.",
    href: "#how-it-works"
  },
  {
    Icon: SlidersHorizontal,
    title: "Scenario Modeling",
    description:
      "Model base case and downside margins at different commodity prices and yields. Know your break-even before you lock in March inputs.",
    href: "#how-it-works"
  },
  {
    Icon: MessageCircle,
    title: "Independent analyst",
    description:
      "Ask questions in plain Midwest language once your data is in. Flags high-cost areas and explains downside risk — no vendor pitch.",
    href: "#dale"
  },
  {
    Icon: TrendingDown,
    title: "Lender Reports",
    description:
      "Generate a structured report with your costs, scenarios, and risk summary — something you can hand your banker, not just gut feel.",
    href: appPath("/register")
  }
];

export default function SolutionsGrid() {
  return (
    <section id="solutions" className="bg-fm-cream py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-fm-teal">Our Solutions</p>
          <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
            Everything you need before you sign in March
          </h2>
          <p className="mt-4 text-lg text-fm-charcoal">
            Fieldmark is built for mid-scale Midwest corn and soybean farmers who want facts, not
            another sales conversation.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {SOLUTIONS.map(({ Icon, title, description, href }) => (
            <article
              key={title}
              className="group rounded-2xl border border-fm-gray-light bg-white p-8 shadow-fm-card transition hover:-translate-y-1 hover:shadow-fm-elevated"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-fm-teal text-white transition group-hover:scale-105">
                <Icon size={28} strokeWidth={1.75} />
              </div>
              <h3 className="font-display mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-fm-charcoal">{description}</p>
              <a
                href={href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-fm-teal hover:underline"
              >
                Learn more →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button href={appPath("/register")} variant="outline">
            Explore Fieldmark
          </Button>
        </div>
      </div>
    </section>
  );
}
