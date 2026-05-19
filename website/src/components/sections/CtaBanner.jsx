import { CheckCircle } from "lucide-react";
import { appPath } from "../../lib/links";
import Button from "../ui/Button";

const PERKS = ["30-day free trial", "Cost comparison tools included", "No credit card required"];

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-fm-teal py-20">
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 40%)"
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Walk into March with ammunition
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Know your margins, validate your input costs, and have a conversation with your lender
          backed by independent data.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle size={18} className="text-fm-gold" />
              {perk}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={appPath("/register")} className="!bg-white !text-fm-teal hover:!bg-fm-cream">
            Start Free Today
          </Button>
          <Button variant="secondary" href={appPath("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    </section>
  );
}
