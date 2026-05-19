import { useEffect, useState } from "react";
import { listVendors } from "../api/vendors";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, meta: pagination } = await listVendors({ per_page: 100 });
        setVendors(data);
        setMeta(pagination);
      } catch {
        setError("Failed to load vendors.");
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
        title="Vendors"
        subtitle={meta ? `${meta.total} vendor listings` : undefined}
      />
      <div className="space-y-3">
        {vendors.map((v) => (
          <Card key={v.id} className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-display font-semibold">{v.name}</p>
              <p className="text-sm text-fm-gray-medium">
                {v.category} · {v.listing_tier}
                {v.active === false ? " · inactive" : ""}
              </p>
            </div>
          </Card>
        ))}
        {vendors.length === 0 && (
          <p className="text-fm-gray-medium">No vendors seeded yet.</p>
        )}
      </div>
    </div>
  );
}
