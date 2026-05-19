import { useEffect, useState } from "react";
import { listFarms } from "../api/farms";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

export default function FarmsPage() {
  const [farms, setFarms] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, meta: pagination } = await listFarms({ per_page: 100 });
        setFarms(data);
        setMeta(pagination);
      } catch {
        setError("Failed to load farms.");
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
      <PageHeader
        title="Farms"
        subtitle={meta ? `${meta.total} farms in the system` : undefined}
      />
      <div className="space-y-3">
        {farms.map((farm) => (
          <Card key={farm.id}>
            <p className="font-display font-semibold">{farm.name}</p>
            <p className="text-sm text-fm-gray-medium">
              {farm.county} · {farm.region} · {farm.total_acres} ac
            </p>
            {farm.user && (
              <p className="text-xs text-fm-gray-medium mt-1">
                Owner: {farm.user.first_name} {farm.user.last_name} ({farm.user.email})
              </p>
            )}
          </Card>
        ))}
        {farms.length === 0 && (
          <p className="text-fm-gray-medium">
            No farms yet. Run <code className="text-sm">cd api && bin/rails db:seed</code> to load sample data.
          </p>
        )}
      </div>
    </div>
  );
}
