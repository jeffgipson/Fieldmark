import { CheckCircle, Database } from "lucide-react";

function FeatureList() {
  return (
    <ul className="mt-8 space-y-4">
      {[
        "Analyze cost centers and operational efficiency",
        "Model scenarios for price, yield, and input changes",
        "Benchmark against aggregated, anonymized peer data",
        "Generate shareable reports for stakeholders"
      ].map((item) => (
        <li key={item} className="flex items-start gap-3">
          <CheckCircle size={20} className="mt-0.5 shrink-0 text-fm-teal" />
          <span className="text-white/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Globe() {
  return (
    <div className="absolute inset-0 z-0 opacity-20 [mask-image:radial-gradient(50%_50%_at_50%_50%,_white_40%,_transparent_100%)]">
      <div
        className="h-full w-full animate-[spin_45s_linear_infinite] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/world-map.svg)" }}
      />
    </div>
  );
}

export default function HeroViz() {
  return (
    <div className="relative w-full flex-1 lg:max-w-2xl">
      <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-gray-900/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-fm-teal/10">
            <Database size={24} className="text-fm-teal" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-white">Financial Command Center</p>
            <p className="text-sm text-white/60">Unified data for smarter decisions</p>
          </div>
        </div>
        <FeatureList />
      </div>
      <Globe />
    </div>
  );
}
