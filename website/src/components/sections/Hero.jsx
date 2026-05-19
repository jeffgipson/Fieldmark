import { BRAND } from "../../constants/brand";
import { appPath } from "../../lib/links";
import Button from "../ui/Button";
import HeroViz from "./HeroViz";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-fm-gray-dark">
      <div
        className="absolute inset-0 bg-gradient-to-br from-fm-gray-dark via-fm-teal-dark to-slate-900 opacity-90"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative mx-auto flex min-h-[95vh] max-w-7xl flex-col items-center gap-12 px-6 pb-24 pt-40 lg:min-h-screen lg:flex-row lg:gap-16 lg:px-8">
        <div className="flex-1 text-center lg:text-left">
          <p className="text-sm font-bold uppercase tracking-widest text-fm-gold">
            Financial Planning for Modern Agriculture
          </p>
          <h1 className="font-display mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Clarity for Every Field.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85 lg:text-xl">
            Fieldmark provides the data-driven insights you need to optimize costs, model scenarios,
            and make critical decisions with confidence. No guesswork.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Button href={appPath("/register")}>Get Started Free</Button>
            <Button variant="secondary" href="#solutions">
              Explore Solutions
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Plan, benchmark, and forecast with a unified view of your operation.
          </p>
        </div>

        <HeroViz />
      </div>
    </section>
  );
}
