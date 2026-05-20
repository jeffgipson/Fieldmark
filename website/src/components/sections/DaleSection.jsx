import { appPath } from "../../lib/links";
import Button from "../ui/Button";

/** Only place on the marketing site where Dale appears visually — in-app persona, not brand hero. */
export default function DaleSection() {
  return (
    <section id="dale" className="overflow-hidden bg-fm-gray-dark py-24 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-fm-gold">Inside the app</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
            Meet D.A.L.E.
          </h2>
          <p className="mt-3 text-lg font-semibold text-fm-gold">Data Analytics for Land Economics</p>
          <p className="mt-6 text-lg text-white/80">
            Your independent agricultural financial analyst. Once your costs and scenarios are in
            Fieldmark, D.A.L.E. reads your numbers, flags high-cost areas, explains downside risk in
            plain language, and never recommends a specific product or dealer.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Specific dollar amounts and percentages — never vague advice",
              "Always shows downside scenarios, not just the rosy case",
              "Respects that you know your land; adds data you did not have",
              "Generates lender-ready reports from your actual numbers"
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fm-gold" />
                <span className="text-white/85">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href={appPath("/register")}>Start Free — meet Dale in the app</Button>
          </div>
          <p className="mt-6 text-xs text-white/50">
            Dale&apos;s analysis is generated using your farm data. For planning purposes only. Not
            financial advice.
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-fm-teal/30 blur-3xl" aria-hidden />
          <img
            src="/images/dale/dale-analyzing.png"
            alt="Dale, Fieldmark's independent analyst"
            className="relative max-h-[min(420px,50vh)] w-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
