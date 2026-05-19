import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import Button from "../ui/Button";
import { DollarInput } from "../ui/Input";
import { formatCurrency } from "../../utils/format";

const BENCHMARK_KEYS = {
  seed: "seed",
  fertilizer: "fertilizer",
  chemicals: "chemicals"
};

export default function InputCostsPanel({
  categories,
  costs,
  onCostChange,
  acres,
  totalPerAcre,
  benchmarkRef,
  saving,
  error,
  onSave
}) {
  const fieldTotal = totalPerAcre * acres;

  return (
    <section className="fm-panel flex flex-col overflow-hidden animate-fm-in">
      <header className="border-b border-fm-gray-light/80 bg-gradient-to-br from-fm-teal-subtle/40 to-white px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="fm-eyebrow">2026 season</p>
            <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-fm-ink">
              Input costs
            </h2>
            <p className="mt-1 text-sm text-fm-charcoal/80">
              Enter what you expect to spend per acre before March commitments.
            </p>
          </div>
          <div className="flex gap-3">
            <SummaryStat label="Per acre" value={`${formatCurrency(totalPerAcre)}/ac`} accent />
            <SummaryStat
              label="Field total"
              value={formatCurrency(fieldTotal)}
              hint={acres > 0 ? `${acres.toLocaleString()} ac` : null}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-2 sm:px-6">
        <div className="hidden sm:grid sm:grid-cols-[1fr_7.5rem_6.5rem] gap-4 border-b border-fm-gray-light/80 px-2 pb-2 pt-4 text-[0.65rem] font-bold uppercase tracking-wider text-fm-gray-medium">
          <span>Category</span>
          <span className="text-center">$/acre</span>
          <span className="text-right">Total</span>
        </div>
        <ul className="divide-y divide-fm-gray-light/90">
          {categories.map(({ key, label }) => {
            const perAcre = Number(costs[key]) || 0;
            const benchKey = BENCHMARK_KEYS[key];
            const bench = benchKey ? benchmarkRef?.[benchKey] : null;
            return (
              <li
                key={key}
                className="grid gap-3 px-2 py-4 transition-colors hover:bg-fm-teal-subtle/20 sm:grid-cols-[1fr_7.5rem_6.5rem] sm:items-center sm:gap-4 sm:py-3.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-fm-ink">{label}</p>
                  {bench != null && (
                    <p className="mt-0.5 text-xs text-fm-gray-medium">
                      Benchmark avg {formatCurrency(bench)}/ac
                    </p>
                  )}
                </div>
                <div className="sm:justify-self-center">
                  <span className="mb-1 block text-[0.65rem] font-bold uppercase text-fm-gray-medium sm:sr-only">
                    $/acre
                  </span>
                  <DollarInput
                    compact
                    value={costs[key] || ""}
                    onChange={(e) => onCostChange(key, e.target.value)}
                  />
                </div>
                <p className="font-display text-right text-base font-bold tabular-nums text-fm-ink sm:text-sm">
                  <span className="mr-2 text-[0.65rem] font-bold uppercase text-fm-gray-medium sm:hidden">
                    Total
                  </span>
                  {formatCurrency(perAcre * acres)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="mx-4 mb-4 flex gap-3 rounded-xl border border-fm-teal/15 bg-fm-teal-subtle/50 px-4 py-3 text-sm text-fm-charcoal sm:mx-6">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-fm-teal" aria-hidden />
        <p className="leading-relaxed">
          <span className="font-semibold text-fm-ink">Extension 2026</span>
          {" "}regional averages — Seed {formatCurrency(benchmarkRef.seed)}/ac · Fertilizer{" "}
          {formatCurrency(benchmarkRef.fertilizer)}/ac · Chemicals {formatCurrency(benchmarkRef.chemicals)}/ac
        </p>
      </aside>

      <footer className="mt-auto border-t border-fm-gray-light/80 bg-fm-cream/40 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/farm"
            className="text-sm font-semibold text-fm-gray-medium transition hover:text-fm-teal"
          >
            ← Back to fields
          </Link>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button className="w-full sm:w-auto" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save & compare"}
              {!saving && <ArrowRight className="h-4 w-4" aria-hidden />}
            </Button>
            {error && <p className="text-sm text-fm-alert">{error}</p>}
          </div>
        </div>
      </footer>
    </section>
  );
}

function SummaryStat({ label, value, hint, accent }) {
  return (
    <div
      className={`min-w-[7.5rem] rounded-xl border px-4 py-3 ${
        accent
          ? "border-fm-teal/20 bg-white shadow-sm"
          : "border-fm-gray-light/80 bg-white/60"
      }`}
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-fm-gray-medium">{label}</p>
      <p className={`fm-stat mt-0.5 text-xl font-bold ${accent ? "text-fm-teal" : "text-fm-ink"}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-fm-gray-medium">{hint}</p>}
    </div>
  );
}
