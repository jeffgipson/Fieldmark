import { useState } from "react";
import { Link } from "react-router-dom";
import * as billingApi from "../../api/billing";
import { formatPlanPrice, PLAN_LABELS, usageLabel } from "../../constants/billing";
import Button from "../ui/Button";
import { friendlyError } from "../../utils/errors";

function formatRenewalDate(iso) {
  if (!iso) return "Renews monthly";
  return `Renews ${new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
}

export default function PlanBillingSection({ subscription, onUpdated }) {
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  if (!subscription) {
    return <p className="text-sm text-fm-gray-medium">Loading billing…</p>;
  }

  const isPro = subscription.plan === "pro";
  const farmsUsed = subscription.usage?.farms_count ?? 0;
  const fieldsUsed = subscription.usage?.fields_count ?? 0;
  const maxFarms = subscription.limits?.max_farms;
  const maxFields = subscription.limits?.max_fields_per_farm;

  async function handleUpgrade() {
    setSaving("upgrade");
    setError(null);
    try {
      const data = await billingApi.checkout("pro");
      onUpdated?.(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  async function handleDowngrade() {
    setSaving("downgrade");
    setError(null);
    try {
      const data = await billingApi.checkout("basic");
      onUpdated?.(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  async function handlePortal() {
    setSaving("portal");
    setError(null);
    try {
      const { url } = await billingApi.openPortal();
      if (url) window.location.href = url;
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div id="billing" className="scroll-mt-24">
      <div className="mb-4">
        <p className="font-display text-2xl font-bold text-fm-ink">
          {subscription.plan_name || PLAN_LABELS[subscription.plan] || subscription.plan}
        </p>
        <p className="text-sm text-fm-gray-medium">
          {formatPlanPrice(subscription.price_cents)}
          {import.meta.env.DEV && subscription.mock ? " · mock billing" : ""}
        </p>
        <p className="mt-1 text-xs text-fm-gray-medium">{formatRenewalDate(subscription.current_period_end)}</p>
      </div>

      <dl className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-fm-gray-medium">Farms</dt>
          <dd className="font-medium text-fm-charcoal">{usageLabel(farmsUsed, maxFarms)}</dd>
        </div>
        <div>
          <dt className="text-fm-gray-medium">Fields on active farm</dt>
          <dd className="font-medium text-fm-charcoal">{usageLabel(fieldsUsed, maxFields)}</dd>
        </div>
      </dl>

      {!isPro && (
        <p className="mb-4 text-sm text-fm-gray-medium">
          Basic includes one farm and up to five fields. Upgrade to Pro for multiple farms and unlimited fields.
        </p>
      )}

      {isPro && (
        <p className="mb-4 text-sm text-fm-gray-medium">
          Pro includes multiple farms and unlimited fields on each farm.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-fm-alert">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {!isPro && (
          <Button type="button" onClick={handleUpgrade} disabled={Boolean(saving)}>
            {saving === "upgrade" ? "Upgrading…" : "Upgrade to Pro ($50/mo)"}
          </Button>
        )}
        {isPro && (
          <Button type="button" variant="secondary" onClick={handleDowngrade} disabled={Boolean(saving)}>
            {saving === "downgrade" ? "Switching…" : "Switch to Basic ($30/mo)"}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={handlePortal} disabled={Boolean(saving)}>
          {saving === "portal" ? "Opening…" : "Manage subscription"}
        </Button>
        {!isPro && (
          <Link to="/farm" className="self-center text-sm font-bold text-fm-teal hover:underline">
            View farm limits →
          </Link>
        )}
      </div>
    </div>
  );
}
