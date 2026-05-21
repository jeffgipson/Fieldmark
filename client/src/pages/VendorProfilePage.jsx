import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Heart, MapPin, Phone } from "lucide-react";
import * as vendorsApi from "../api/vendors";
import VendorLocationMap from "../components/vendors/VendorLocationMap";
import Card from "../components/ui/Card";
import LoadingDale from "../components/ui/LoadingDale";
import useVendorFavorites from "../hooks/useVendorFavorites";
import BrandLogo from "../components/ui/BrandLogo";
import { categoryLabel, vendorCategoryIcon } from "../constants/vendors";
import { vendorLogoUrl } from "../lib/brandLogos";
import { friendlyError } from "../utils/errors";

export default function VendorProfilePage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useVendorFavorites();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    vendorsApi
      .getVendor(slug)
      .then((data) => {
        if (!cancelled) setVendor(data);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <LoadingDale message="Loading partner profile..." />;

  if (error || !vendor) {
    return (
      <div>
        <Link to="/resources" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-fm-teal">
          <ArrowLeft size={16} /> Back to resources
        </Link>
        <Card>
          <p className="text-fm-alert">{error || "Partner profile not found."}</p>
        </Card>
      </div>
    );
  }

  const favorited = isFavorite(vendor.id) || vendor.favorited;
  const offerings = Array.isArray(vendor.offerings) ? vendor.offerings : [];
  const mapsUrl =
    vendor.full_address != null
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.full_address)}`
      : vendor.latitude != null && vendor.longitude != null
        ? `https://www.google.com/maps?q=${vendor.latitude},${vendor.longitude}`
        : null;

  return (
    <div>
      <Link to="/resources" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-fm-teal">
        <ArrowLeft size={16} /> All resources
      </Link>

      <Card className="mb-6 !p-4" hover={false}>
        <div className="flex items-start gap-3">
          <BrandLogo
            logoUrl={vendorLogoUrl(vendor)}
            icon={vendorCategoryIcon(vendor.category)}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="fm-eyebrow mb-1">{categoryLabel(vendor.category)}</p>
            <h1 className="font-display text-xl font-bold tracking-tight text-fm-ink lg:text-2xl">
              {vendor.name}
            </h1>
            {(vendor.full_address || vendor.city) && (
              <p className="mt-1.5 text-sm text-fm-gray-medium">
                {vendor.full_address || `${vendor.city}, ${vendor.state}`}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {vendor.partner && (
            <span className="rounded-full bg-fm-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fm-gold">
              Partner
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(vendor.id)}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="inline-flex items-center gap-1.5 rounded-full border border-fm-gray-light px-3 py-1.5 text-xs font-bold text-fm-teal"
          >
            <Heart size={16} className={favorited ? "fill-fm-alert text-fm-alert" : ""} />
            {favorited ? "Favorited" : "Favorite"}
          </button>
        </div>
      </Card>

      <p className="mb-6 text-xs text-fm-gray-medium">
        Fieldmark lists local businesses for your research. This is not an endorsement — verify services and pricing
        directly.
      </p>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-6">
          <Card variant="flat" className="!p-0 overflow-hidden">
            <VendorLocationMap
              latitude={vendor.latitude}
              longitude={vendor.longitude}
              name={vendor.name}
            />
            {mapsUrl && (
              <p className="border-t border-fm-gray-light px-4 py-3 text-sm">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-fm-teal"
                >
                  <MapPin size={14} /> Open in Google Maps
                </a>
              </p>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-fm-charcoal">What they offer</h2>
            <p className="mt-3 text-sm leading-relaxed text-fm-gray-medium">
              {vendor.profile_summary || vendor.description}
            </p>
            {offerings.length > 0 && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-fm-charcoal">
                {offerings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <aside className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-fm-gray-medium">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {vendor.phone && (
                <li>
                  <a href={`tel:${vendor.phone}`} className="inline-flex items-center gap-2 font-medium text-fm-teal">
                    <Phone size={16} /> {vendor.phone}
                  </a>
                </li>
              )}
              {vendor.website && (
                <li>
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-fm-teal break-all"
                  >
                    <ExternalLink size={16} /> Website
                  </a>
                </li>
              )}
              {vendor.full_address && (
                <li className="text-fm-gray-medium">
                  <MapPin size={16} className="mb-1 inline text-fm-teal" />
                  <span className="block">{vendor.full_address}</span>
                </li>
              )}
            </ul>
          </Card>

          {Array.isArray(vendor.counties) && vendor.counties.length > 0 && (
            <Card>
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-fm-gray-medium">
                Service area
              </h2>
              <p className="mt-3 text-sm text-fm-charcoal">
                {vendor.serves_statewide ? "Missouri statewide" : vendor.counties.join(", ")}
              </p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
