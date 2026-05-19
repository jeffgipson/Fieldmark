import { useCallback, useEffect, useState } from "react";
import * as vendorsApi from "../api/vendors";
import VendorCard from "../components/vendors/VendorCard";
import { VENDOR_CATEGORIES, categoryLabel } from "../constants/vendors";
import Card from "../components/ui/Card";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { useFarm } from "../contexts/FarmContext";
import useVendorFavorites from "../hooks/useVendorFavorites";
import { friendlyError } from "../utils/errors";

export default function ResourcesPage() {
  const { farm } = useFarm();
  const [category, setCategory] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contacts, isFavorite, toggleFavorite, loading: favoritesLoading } = useVendorFavorites();

  const county = farm?.county;
  const region = farm?.region;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { county, region };
      if (category) params.category = category;
      const vendorList = await vendorsApi.listVendors(params);
      setVendors(vendorList);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [category, county, region]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayedVendors = showFavoritesOnly
    ? vendors.filter((v) => isFavorite(v.id))
    : category
      ? vendors.filter((v) => !isFavorite(v.id))
      : vendors.filter((v) => !isFavorite(v.id));

  const favoriteContacts =
    category && !showFavoritesOnly
      ? contacts.filter((c) => c.vendor?.category === category)
      : contacts;

  if (loading || favoritesLoading) return <LoadingDale message="Loading local resources..." />;

  return (
    <div>
      <PageHeader
        eyebrow="Support network"
        title="Local resources"
        subtitle={county ? `${county} County, Missouri` : "Missouri"}
      />
      <p className="mb-6 text-sm text-fm-gray-medium">
        Directory for lenders, input suppliers, and farm services. Tap the heart to save a vendor to your list.
        Fieldmark does not endorse vendors; partner listings may be paid.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setShowFavoritesOnly(false);
            setCategory("");
          }}
          className={`rounded-full px-3 py-1 text-xs font-bold ${!category && !showFavoritesOnly ? "bg-fm-teal text-white" : "bg-fm-gray-light text-fm-charcoal"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => {
            setShowFavoritesOnly(true);
            setCategory("");
          }}
          className={`rounded-full px-3 py-1 text-xs font-bold ${showFavoritesOnly ? "bg-fm-teal text-white" : "bg-fm-gray-light text-fm-charcoal"}`}
        >
          Favorites{contacts.length > 0 ? ` (${contacts.length})` : ""}
        </button>
        {VENDOR_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setShowFavoritesOnly(false);
              setCategory(c.value);
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold ${category === c.value && !showFavoritesOnly ? "bg-fm-teal text-white" : "bg-fm-gray-light text-fm-charcoal"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-fm-alert">{error}</p>}

      {favoriteContacts.length > 0 && !showFavoritesOnly && (
        <section className="mb-10">
          <h2 className="font-display text-lg font-semibold mb-4">Your favorites</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {favoriteContacts.map((c) => (
              <VendorCard
                key={c.id}
                vendor={c.vendor}
                favorited
                onToggleFavorite={() => toggleFavorite(c.vendor.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">
          {showFavoritesOnly
            ? "Favorites"
            : category
              ? categoryLabel(category)
              : "All categories"}
        </h2>
        {displayedVendors.length === 0 ? (
          <Card>
            <p className="text-fm-gray-medium">
              {showFavoritesOnly
                ? "No favorites yet. Heart a vendor from the directory to save them here."
                : "No vendors listed for this filter yet."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {displayedVendors.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                favorited={isFavorite(v.id) || v.favorited}
                onToggleFavorite={() => toggleFavorite(v.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
