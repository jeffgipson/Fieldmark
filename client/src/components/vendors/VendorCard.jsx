import { Link } from "react-router-dom";
import { ExternalLink, Heart, Phone } from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import { categoryLabel, vendorCategoryIcon } from "../../constants/vendors";
import { vendorLogoUrl } from "../../lib/brandLogos";

export default function VendorCard({
  vendor,
  favorited = false,
  onToggleFavorite,
  compact = false
}) {
  const showFavorite = Boolean(onToggleFavorite);
  const CategoryIcon = vendorCategoryIcon(vendor.category);

  return (
    <article className={`rounded-xl border border-fm-gray-light bg-fm-surface p-4 ${compact ? "" : "shadow-sm"}`}>
      <div className="flex items-start justify-between gap-3">
        <BrandLogo
          logoUrl={vendorLogoUrl(vendor)}
          icon={CategoryIcon}
          size={compact ? "sm" : "md"}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-fm-charcoal">
            {vendor.has_profile && vendor.slug ? (
              <Link to={`/resources/${vendor.slug}`} className="hover:text-fm-teal">
                {vendor.name}
              </Link>
            ) : (
              vendor.name
            )}
          </h3>
          <p className="text-xs text-fm-gray-medium">{categoryLabel(vendor.category)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {vendor.partner && (
            <span className="rounded-full bg-fm-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fm-gold">
              Partner
            </span>
          )}
          {showFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite()}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorited}
              className="rounded-full p-1 text-fm-gray-medium transition-colors hover:bg-fm-gray-light hover:text-fm-alert"
            >
              <Heart
                size={18}
                className={favorited ? "fill-fm-alert text-fm-alert" : ""}
                strokeWidth={favorited ? 0 : 2}
              />
            </button>
          )}
        </div>
      </div>
      {!compact && vendor.description && (
        <p className="mt-2 text-sm text-fm-gray-medium line-clamp-2">{vendor.description}</p>
      )}
      {vendor.has_profile && vendor.slug && (
        <Link
          to={`/resources/${vendor.slug}`}
          className="mt-2 inline-block text-xs font-bold text-fm-teal hover:underline"
        >
          View partner profile →
        </Link>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {vendor.phone && (
          <a href={`tel:${vendor.phone}`} className="inline-flex items-center gap-1 font-medium text-fm-teal">
            <Phone size={14} /> {vendor.phone}
          </a>
        )}
        {vendor.website && (
          <a
            href={vendor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-fm-teal"
          >
            <ExternalLink size={14} /> Website
          </a>
        )}
      </div>
    </article>
  );
}
