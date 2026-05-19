import { useEffect, useState } from "react";
import { getStats } from "../api/stats";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

function StatCard({ title, value }) {
  return (
    <Card className="text-center">
      <p className="text-4xl font-bold font-display">{value}</p>
      <p className="text-sm text-fm-gray-medium">{title}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
      } catch {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    }
    void loadStats();
  }, []);

  if (loading || !stats) return <div>Loading...</div>;
  if (error) return <p className="text-red-500">{error}</p>;

  const needsSeed = stats.users <= 1 && stats.farms === 0;

  return (
    <div>
      <PageHeader title="Dashboard" />
      {needsSeed && (
        <Card className="mb-6 border-l-4 border-l-fm-gold bg-fm-gold-muted">
          <p className="font-display font-semibold text-fm-ink">No sample data in this database</p>
          <p className="mt-2 text-sm text-fm-charcoal">
            Only the admin account exists. Load demo farmers, farms, and vendors:
          </p>
          <pre className="mt-3 rounded-lg bg-fm-gray-light/80 p-3 text-sm overflow-x-auto">
            cd api{"\n"}bin/rails db:seed
          </pre>
          <p className="mt-2 text-xs text-fm-gray-medium">
            Refresh this page after seeding (~1 minute for 100 farmers).
          </p>
        </Card>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Farms" value={stats.farms} />
        <StatCard title="Fields" value={stats.fields} />
        <StatCard title="Scenarios" value={stats.scenarios} />
        <StatCard title="Vendors" value={stats.vendors} />
      </div>
    </div>
  );
}
