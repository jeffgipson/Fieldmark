import { Check } from "lucide-react";
import { PRICING_PLANS } from "../../constants/pricing";
import { appPath } from "../../lib/links";
import Button from "../ui/Button";

export default function PricingTable() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-fm-teal">Pricing</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-fm-ink sm:text-4xl">
            Simple plans for serious planning
          </h2>
          <p className="mt-4 text-lg text-fm-charcoal">
            Start on Basic when you sign up. Upgrade to Pro anytime when you need more farms or fields.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.key}
              className={[
                "relative flex flex-col rounded-2xl border p-8 shadow-fm-card transition",
                plan.highlighted
                  ? "border-fm-teal bg-fm-cream ring-2 ring-fm-teal ring-offset-2 ring-offset-white"
                  : "border-fm-gray-light bg-white hover:-translate-y-1 hover:shadow-fm-elevated"
              ].join(" ")}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fm-teal px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Best for multi-farm
                </span>
              )}

              <div>
                <h3 className="font-display text-2xl font-bold text-fm-ink">{plan.name}</h3>
                <p className="mt-2 text-sm text-fm-charcoal">{plan.description}</p>
              </div>

              <p className="mt-8 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-fm-ink">${plan.priceMonthly}</span>
                <span className="text-fm-gray-medium">/month</span>
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-fm-charcoal">
                    <Check
                      size={18}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0 text-fm-teal"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button
                  href={appPath("/register")}
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full justify-center"
                >
                  {plan.cta}
                </Button>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-fm-gray-medium">
          New accounts begin on Basic with full access to benchmarks, scenarios, and Dale. Billing is
          managed in your account after sign-up. Questions? Use the chat in the corner.
        </p>
      </div>
    </section>
  );
}
