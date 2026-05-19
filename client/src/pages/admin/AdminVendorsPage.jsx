import { useCallback, useEffect, useState } from "react";
import * as vendorsApi from "../../api/vendors";
import { categoryLabel } from "../../constants/vendors";
import Card from "../../components/ui/Card";
import LoadingDale from "../../components/ui/LoadingDale";
import PageHeader from "../../components/ui/PageHeader";
import { friendlyError } from "../../utils/errors";

const LISTING_TIERS = [
  { value: "standard", label: "Standard" },
  { value: "featured", label: "Featured" },
  { value: "premium", label: "Premium" }
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await vendorsApi.adminListVendors({ per_page: 100 });
      setVendors(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleTierChange(vendor, listingTier) {
    setSavingId(vendor.id);
    try {
      const updated = await vendorsApi.adminUpdateVendor(vendor.id, { listing_tier: listingTier });
      setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleSponsoredChange(vendor, sponsored) {
    setSavingId(vendor.id);
    try {
      const updated = await vendorsApi.adminUpdateVendor(vendor.id, { sponsored });
      setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <LoadingDale message="Loading vendor listings..." />;

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Vendor listings"
        subtitle="Manage listing tier and partner badges"
      />
      <p className="mb-6 text-sm text-fm-gray-medium">
        Sign in as admin@fieldmark.app to edit tiers. Changes apply to the public directory immediately.
      </p>

      {error && <p className="mb-4 text-fm-alert">{error}</p>}

      {vendors.length === 0 ? (
        <Card>
          <p className="text-fm-gray-medium">No vendors found. Run <code className="text-xs">bin/rails vendors:seed</code> on the API.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-fm-gray-light">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-fm-gray-light/50 text-xs font-bold uppercase tracking-wide text-fm-gray-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-fm-gray-light">
                  <td className="px-4 py-3 font-medium text-fm-charcoal">{v.name}</td>
                  <td className="px-4 py-3 text-fm-gray-medium">{categoryLabel(v.category)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={v.listing_tier}
                      disabled={savingId === v.id}
                      onChange={(e) => handleTierChange(v, e.target.value)}
                      className="rounded-lg border border-fm-gray-light bg-fm-surface px-2 py-1 text-sm"
                    >
                      {LISTING_TIERS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(v.sponsored)}
                        disabled={savingId === v.id}
                        onChange={(e) => handleSponsoredChange(v, e.target.checked)}
                      />
                      <span className="text-xs text-fm-gray-medium">Sponsored</span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    {v.active ? (
                      <span className="text-fm-success">Yes</span>
                    ) : (
                      <span className="text-fm-gray-medium">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
