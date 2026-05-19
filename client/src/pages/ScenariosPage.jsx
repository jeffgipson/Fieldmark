import { Link } from "react-router-dom";
import * as scenariosApi from "../api/scenarios";
import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { useFarm } from "../contexts/FarmContext";
import { friendlyError } from "../utils/errors";

export default function ScenariosPage() {
  const { farm, scenarios, refresh } = useFarm();
  const [name, setName] = useState("Base Case 2026");
  const [error, setError] = useState(null);

  async function createScenario() {
    try {
      await scenariosApi.createScenario(farm.id, {
        name,
        commodity_price: 4.33,
        yield_assumption: 176,
        downside_commodity_price: 3.8,
        downside_yield: 160
      });
      refresh();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div>
      <PageHeader title="Scenarios" subtitle="Model base and downside margins before March." />
      <Card className="mb-6">
        <Label>New scenario name</Label>
        <div className="mt-2 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={createScenario}>Create</Button>
        </div>
      </Card>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <Card key={s.id} className="flex flex-wrap items-center justify-between gap-2 !p-4">
            <p className="font-bold">{s.name}</p>
            <div className="flex gap-3 text-sm font-bold">
              <Link to={`/scenarios/${s.id}`} className="text-fm-teal hover:underline">Edit</Link>
              <Link to={`/scenarios/${s.id}/benchmark`} className="text-fm-teal hover:underline">Benchmark</Link>
            </div>
          </Card>
        ))}
      </div>
      {error && <p className="text-fm-alert mt-4">{error}</p>}
    </div>
  );
}
