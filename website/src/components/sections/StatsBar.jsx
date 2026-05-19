import { Database, FileText, Shield } from "lucide-react";

const STATS = [
  {
    Icon: Shield,
    value: "Independent Analysis",
    label: "Our AI-powered tools have no ties to input vendors or channel partners."
  },
  {
    Icon: Database,
    value: "Trusted Benchmarks",
    label: "Compare your operation against aggregated data from public and partner sources."
  },
  {
    Icon: FileText,
    value: "Shareable Intelligence",
    label: "Export and share structured reports with lenders, partners, and stakeholders."
  }
];

export default function StatsBar() {
  return (
    <section className="relative z-10 -mt-16 px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {STATS.map(({ Icon, value, label }, i) => (
          <div
            key={value}
            className="stat-reveal rounded-2xl border border-fm-gray-light bg-white p-8 shadow-fm-elevated"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fm-teal/10">
              <Icon className="text-fm-teal" size={24} strokeWidth={2} />
            </div>
            <p className="font-display mt-5 text-2xl font-bold text-fm-gray-dark">{value}</p>
            <p className="mt-2 text-fm-charcoal">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
