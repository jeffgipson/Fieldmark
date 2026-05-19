import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDaleChat } from "../contexts/DaleChatContext";
import * as scenariosApi from "../api/scenarios";
import DaleBriefingCard from "../components/dale/DaleBriefingCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { useFarm } from "../contexts/FarmContext";
import { formatCurrency, formatPerAcre } from "../utils/format";
import { friendlyError } from "../utils/errors";

function MarginBox({ title, data, variant = "teal" }) {
  if (!data) return null;
  const negative = Number(data.margin_per_acre) < 0;
  const border =
    variant === "downside"
      ? negative
        ? "border-fm-alert"
        : "border-fm-gold"
      : "border-fm-teal";
  return (
    <Card className={`border-2 ${border}`}>
      <h3 className="font-display font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-fm-charcoal">
        <li>Revenue/acre: {formatPerAcre(data.revenue_per_acre)}</li>
        <li>Total cost/acre: {formatPerAcre(data.operating_cost_per_acre)}</li>
        <li className={negative ? "text-fm-alert font-bold" : "text-fm-success font-bold"}>
          Net margin/acre: {formatPerAcre(data.margin_per_acre)}
        </li>
        <li className="font-display text-2xl font-bold">
          Total farm net: {formatCurrency(data.total_margin)}
        </li>
      </ul>
    </Card>
  );
}

export default function ScenarioPage() {
  const { id: scenarioId } = useParams();
  const { farm, refresh } = useFarm();
  const { openChat } = useDaleChat();
  const [scenario, setScenario] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farm || !scenarioId) return;
    scenariosApi.getScenario(farm.id, scenarioId).then((s) => {
      setScenario(s);
      setForm({
        name: s.name,
        commodity_price: s.commodity_price || "4.33",
        yield_assumption: s.yield_assumption || "176",
        downside_commodity_price: s.downside_commodity_price || "3.80",
        downside_yield: s.downside_yield || "160"
      });
      setLoading(false);
    }).catch((err) => {
      setError(friendlyError(err));
      setLoading(false);
    });
  }, [farm, scenarioId]);

  async function handleCalculate(e) {
    e.preventDefault();
    setCalculating(true);
    setError(null);
    try {
      await scenariosApi.updateScenario(farm.id, scenarioId, {
        name: form.name,
        commodity_price: Number(form.commodity_price),
        yield_assumption: Number(form.yield_assumption),
        downside_commodity_price: Number(form.downside_commodity_price),
        downside_yield: Number(form.downside_yield)
      });
      const updated = await scenariosApi.calculateScenario(farm.id, scenarioId);
      setScenario(updated);
      await refresh();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setCalculating(false);
    }
  }

  if (loading) return <LoadingDale />;
  const results = scenario?.results;
  const monthsCarry = 8;

  return (
    <div>
      <PageHeader title="Scenario modeling" subtitle={scenario?.name} />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div><Label>Scenario name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <h4 className="font-display font-semibold text-fm-teal">Base case</h4>
            <div><Label>Commodity price ($/bu)</Label><Input type="number" step="0.01" value={form.commodity_price} onChange={(e) => setForm({ ...form, commodity_price: e.target.value })} /></div>
            <div><Label>Expected yield (bu/ac)</Label><Input type="number" value={form.yield_assumption} onChange={(e) => setForm({ ...form, yield_assumption: e.target.value })} /></div>
            <h4 className="font-display font-semibold text-fm-gold">Downside case</h4>
            <div><Label>Commodity price ($/bu)</Label><Input type="number" step="0.01" value={form.downside_commodity_price} onChange={(e) => setForm({ ...form, downside_commodity_price: e.target.value })} /></div>
            <div><Label>Expected yield (bu/ac)</Label><Input type="number" value={form.downside_yield} onChange={(e) => setForm({ ...form, downside_yield: e.target.value })} /></div>
            <Button type="submit" disabled={calculating}>{calculating ? "Calculating..." : "Calculate →"}</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {results ? (
            <>
              <MarginBox title="Base case" data={results.base_case} />
              <MarginBox title="Downside case" data={results.downside_case} variant="downside" />
              <p className="text-sm text-fm-charcoal">
                At {results.base_case?.total_acres || farm?.total_acres} acres you will commit approximately{" "}
                {formatCurrency((results.base_case?.operating_cost_per_acre || 0) * (results.base_case?.total_acres || 0))}{" "}
                in March. Revenue arrives in November — {monthsCarry} months of carrying cost at current rates.
              </p>
              <DaleBriefingCard
                findings={[`Base margin ${formatPerAcre(results.base_case?.margin_per_acre)}; downside ${formatPerAcre(results.downside_case?.margin_per_acre)}.`]}
                onTalkToDale={openChat}
              />
            </>
          ) : (
            <p className="text-fm-gray-medium">Enter assumptions and calculate to see margins.</p>
          )}
        </div>
      </div>
      {error && <p className="mt-4 text-fm-alert">{error}</p>}
      <Link to={`/scenarios/${scenarioId}/benchmark`} className="mt-6 inline-block text-fm-teal font-bold">
        View benchmark comparison →
      </Link>
    </div>
  );
}
