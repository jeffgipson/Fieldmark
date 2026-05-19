import { useEffect, useState } from "react";
import { listBenchmarkRegions } from "../api/benchmarks";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

export default function BenchmarksPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listBenchmarkRegions();
        setRegions(data);
      } catch {
        setError("Failed to load benchmarks.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <PageHeader title="Benchmarks" subtitle="Extension reference costs by region" />
      <div className="space-y-3">
        {regions.map((r) => (
          <Card key={r.id}>
            <p className="font-display font-semibold capitalize">
              {r.region} · {r.commodity} · {r.season_year}
            </p>
            <p className="text-sm text-fm-gray-medium">
              Operating: ${r.total_operating_cost_per_acre}/ac · Total: ${r.total_cost_per_acre}/ac
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
