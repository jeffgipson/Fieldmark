import { useState } from "react";
import { ChevronDown } from "lucide-react";
import HowItWorksSidebar from "./HowItWorksSidebar";

const STEPS = [
  {
    num: "01",
    title: "Enter your costs",
    summary: "Add fields and per-acre input costs for the current season.",
    detail:
      "Seed, fertilizer, chemicals, and other operating costs — broken out by field so you see where the spend actually lands."
  },
  {
    num: "02",
    title: "Compare to peers",
    summary: "See your numbers against MU Extension regional benchmarks.",
    detail:
      "Line-by-line flags show where you are below, at, or above average. No guesswork, no co-op spin."
  },
  {
    num: "03",
    title: "Run scenarios",
    summary: "Model base case and downside before you commit.",
    detail:
      "What if corn drops to $3.80? What if yields come in light? See margin impact on your whole farm, not just one field."
  },
  {
    num: "04",
    title: "Walk in with ammunition",
    summary: "Get plain-language analysis and a lender-ready report.",
    detail:
      "Ask your independent analyst questions in plain language. Export a structured summary you can share with your banker — backed by your data and MU Extension benchmarks."
  }
];

export default function HowItWorks() {
  const [open, setOpen] = useState(0);

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-fm-teal">How It Works</p>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
              From anxiety to confidence in four steps
            </h2>
            <p className="mt-4 text-lg text-fm-charcoal">
              Fieldmark is not another spreadsheet and not a replacement for your agronomist or
              lender. It is the independent data layer you have not had before March.
            </p>
            <HowItWorksSidebar />
          </div>

          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={step.num}
                  className={[
                    "overflow-hidden rounded-xl border transition-all duration-300",
                    isOpen
                      ? "border-fm-teal/30 bg-fm-cream shadow-fm-card"
                      : "border-fm-gray-light bg-white hover:border-fm-teal/20"
                  ].join(" ")}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-4 p-6 text-left"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-3xl font-bold text-fm-teal/40">{step.num}</span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                      <p className="mt-1 text-fm-charcoal">{step.summary}</p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={[
                        "mt-1 shrink-0 text-fm-teal transition-transform duration-300",
                        isOpen ? "rotate-180" : ""
                      ].join(" ")}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-fm-gray-light px-6 pb-6 pl-[4.5rem]">
                      <p className="text-fm-charcoal">{step.detail}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
