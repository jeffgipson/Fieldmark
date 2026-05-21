import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { INTEGRATION_UI, STATUS_LABELS } from "../../constants/integrations";
import { useDaleChat } from "../../contexts/DaleChatContext";
import Button from "../ui/Button";
import Card from "../ui/Card";
import BrandLogo from "../ui/BrandLogo";
import { integrationLogoUrl } from "../../lib/brandLogos";

function StatusBadge({ status, connected }) {
  if (connected === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
        Connected
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-fm-teal/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-fm-teal">
        {STATUS_LABELS.active}
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center rounded-full bg-fm-gold/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-900">
        {STATUS_LABELS.in_progress}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-fm-gray-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-fm-gray-medium">
      {STATUS_LABELS.planned}
    </span>
  );
}

export default function IntegrationCard({ integration, categoryLabel }) {
  const { openChat } = useDaleChat();
  const ui = INTEGRATION_UI[integration.slug] || { icon: Plug };
  const Icon = ui.icon;
  const showConnectionHint =
    integration.status === "active" && integration.connected === false;

  function renderAction() {
    if (integration.status !== "active") return null;

    if (ui.action === "dale") {
      return (
        <Button type="button" variant="secondary" className="text-xs" onClick={openChat}>
          Open Dale
        </Button>
      );
    }

    if (!ui.href) return null;

    if (ui.external) {
      return (
        <a
          href={ui.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-fm-teal hover:underline"
        >
          Open docs
          <ExternalLink size={12} />
        </a>
      );
    }

    return (
      <Link to={ui.href} className="text-xs font-bold text-fm-teal hover:underline">
        Go to feature →
      </Link>
    );
  }

  return (
    <Card hover={false} className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <BrandLogo logoUrl={integrationLogoUrl(integration)} icon={Icon} fit={ui.logoFit} />
        <StatusBadge status={integration.status} connected={integration.connected} />
      </div>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-fm-gray-medium">
        {categoryLabel}
      </p>
      <h3 className="font-display mt-1 text-lg font-semibold text-fm-ink">{integration.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fm-charcoal">{integration.description}</p>

      <p className="mt-4 text-xs text-fm-gray-medium">
        <span className="font-bold text-fm-charcoal">Used in:</span> {integration.used_in}
      </p>

      {showConnectionHint && (
        <p className="mt-2 text-xs text-amber-800">
          Available — your operator has not configured credentials for this environment yet.
        </p>
      )}

      {integration.status === "in_progress" && (
        <p className="mt-2 text-xs text-fm-gray-medium">
          On the roadmap. Your farm data works without this — we will notify you when it ships.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-fm-gray-light/80 pt-4">
        {renderAction()}
        {integration.docs_url && (
          <a
            href={integration.docs_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-fm-gray-medium hover:text-fm-teal"
          >
            Source
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </Card>
  );
}
