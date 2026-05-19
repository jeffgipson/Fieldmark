import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import * as vendorsApi from "../../api/vendors";
import VendorCard from "./VendorCard";
import Card from "../ui/Card";
import useVendorFavorites from "../../hooks/useVendorFavorites";
import { friendlyError } from "../../utils/errors";

export default function RecommendationsPanel({ farmId, scenarioId, county }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useVendorFavorites();

  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;
    vendorsApi
      .getVendorRecommendations({ farm_id: farmId, scenario_id: scenarioId })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [farmId, scenarioId]);

  const recs = data?.recommendations?.filter((r) => r.vendors?.length) || [];
  if (!recs.length && !error) return null;

  return (
    <Card className="mt-6 border-fm-teal/20 bg-fm-teal-subtle/30">
      <h3 className="font-display text-lg font-semibold text-fm-charcoal">Local resources</h3>
      <p className="mt-1 text-xs text-fm-gray-medium">
        Fieldmark does not endorse vendors. Partner listings may be paid. Heart a vendor to save them for later.
        {county ? ` Showing contacts for ${county} County.` : ""}
      </p>
      {error && <p className="mt-2 text-sm text-fm-alert">{error}</p>}
      <div className="mt-4 space-y-6">
        {recs.slice(0, 3).map((rec) => (
          <div key={rec.category}>
            <p className="text-sm font-medium text-fm-charcoal">{rec.category_label}</p>
            <p className="text-xs text-fm-gray-medium">{rec.reason}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {rec.vendors.slice(0, 2).map((v) => (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  compact
                  favorited={isFavorite(v.id) || v.favorited}
                  onToggleFavorite={() => toggleFavorite(v.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link to="/resources" className="mt-4 inline-block text-sm font-bold text-fm-teal">
        View all local resources →
      </Link>
    </Card>
  );
}
