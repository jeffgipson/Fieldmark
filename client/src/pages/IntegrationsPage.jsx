import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as integrationsApi from "../api/integrations";
import IntegrationCard from "../components/integrations/IntegrationCard";
import Card from "../components/ui/Card";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { DEFAULT_CATEGORY_LABEL, STATUS_FILTER_OPTIONS } from "../constants/integrations";
import { friendlyError } from "../utils/errors";

export default function IntegrationsPage() {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await integrationsApi.listIntegrations();
      setCatalog(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = catalog?.categories || {};
  const integrations = catalog?.integrations || [];

  const categoryOptions = useMemo(() => {
    const keys = [...new Set(integrations.map((item) => item.category))];
    return keys.sort((a, b) => (categories[a] || a).localeCompare(categories[b] || b));
  }, [integrations, categories]);

  const filtered = useMemo(() => {
    return integrations.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      return true;
    });
  }, [integrations, statusFilter, categoryFilter]);

  const counts = useMemo(() => {
    return integrations.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { active: 0, in_progress: 0, planned: 0 }
    );
  }, [integrations]);

  if (loading) return <LoadingDale message="Loading integrations..." />;

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="Connections" title="Integration center" />
        <Card variant="danger">
          <p className="text-sm text-fm-charcoal">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Connections"
        title="Integration center"
        subtitle="Data sources and tools that power your margins. Active integrations work today; others are on the roadmap."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card hover={false} className="border-l-[3px] border-l-fm-teal">
          <p className="text-2xl font-bold text-fm-ink">{counts.active}</p>
          <p className="text-sm text-fm-charcoal">Active today</p>
        </Card>
        <Card hover={false} className="border-l-[3px] border-l-fm-gold">
          <p className="text-2xl font-bold text-fm-ink">{counts.in_progress}</p>
          <p className="text-sm text-fm-charcoal">In progress</p>
        </Card>
        <Card hover={false} className="border-l-[3px] border-l-fm-gray-medium">
          <p className="text-2xl font-bold text-fm-ink">{counts.planned}</p>
          <p className="text-sm text-fm-charcoal">Planned</p>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              statusFilter === value ? "bg-fm-teal text-white" : "bg-fm-gray-light text-fm-charcoal hover:bg-fm-gray-light/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {categoryOptions.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              categoryFilter === "all"
                ? "border-fm-teal bg-fm-teal/10 text-fm-teal"
                : "border-fm-gray-light text-fm-gray-medium"
            }`}
          >
            All categories
          </button>
          {categoryOptions.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                categoryFilter === key
                  ? "border-fm-teal bg-fm-teal/10 text-fm-teal"
                  : "border-fm-gray-light text-fm-gray-medium"
              }`}
            >
              {categories[key] || key}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-fm-charcoal">No integrations match these filters.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((integration) => (
            <IntegrationCard
              key={integration.slug}
              integration={integration}
              categoryLabel={categories[integration.category] || DEFAULT_CATEGORY_LABEL}
            />
          ))}
        </div>
      )}

      <Card className="mt-10" variant="dale">
        <p className="text-sm leading-relaxed text-fm-charcoal">
          Fieldmark stays independent — we connect to public benchmarks and your data, not input vendor
          catalogs. Dale never recommends a supplier by name. Questions about a specific integration?{" "}
          <Link to="/help" className="font-bold text-fm-teal hover:underline">
            Help &amp; support
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
