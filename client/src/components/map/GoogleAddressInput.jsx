import { useEffect, useRef, useState } from "react";
import { mapDebug, mapDebugWarn } from "../../utils/mapDebug";

const SCRIPT_ID = "google-maps-places";

function loadGooglePlaces(apiKey) {
  if (window.google?.maps?.importLibrary) {
    return window.google.maps.importLibrary("places").then(() => window.google);
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(script);
  });
}

/**
 * Address field with Google Places Autocomplete (uncontrolled input — required by Google).
 */
export default function GoogleAddressInput({
  apiKey,
  className = "",
  placeholder = "Search address…",
  initialValue = "",
  onPlaceSelect,
  onInputChange
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!apiKey?.trim() || !inputRef.current) return undefined;

    let cancelled = false;
    setLoadError(null);
    setReady(false);

    loadGooglePlaces(apiKey.trim())
      .then((google) => {
        if (cancelled || !inputRef.current) return;

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "us" },
          fields: ["geometry", "formatted_address", "name"]
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const loc = place.geometry?.location;
          if (!loc) {
            mapDebugWarn("google:place_no_geometry", place);
            return;
          }

          const display_name = place.formatted_address || place.name || inputRef.current?.value || "";
          if (inputRef.current) inputRef.current.value = display_name;

          mapDebug("google:place_select", { display_name, lat: loc.lat(), lng: loc.lng() });
          onPlaceSelect?.({
            latitude: loc.lat(),
            longitude: loc.lng(),
            display_name
          });
        });

        autocompleteRef.current = autocomplete;
        setReady(true);
        mapDebug("google:autocomplete_ready");
      })
      .catch((err) => {
        if (cancelled) return;
        mapDebugWarn("google:load_error", err?.message);
        setLoadError(err?.message || "Could not load Google Places");
      });

    return () => {
      cancelled = true;
      const instance = autocompleteRef.current;
      if (instance && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(instance);
      }
      autocompleteRef.current = null;
      setReady(false);
    };
  }, [apiKey, onPlaceSelect]);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        defaultValue={initialValue}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onInputChange?.(e.target.value)}
        className={`w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3 text-base text-fm-charcoal placeholder:text-fm-gray-medium focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15 ${className}`}
      />
      {loadError && (
        <p className="mt-1 text-xs text-fm-alert">
          Google Places: {loadError}. Check API key, billing, and that Places API is enabled.
        </p>
      )}
      {!loadError && apiKey && !ready && (
        <p className="mt-1 text-xs text-fm-gray-medium">Loading address search…</p>
      )}
    </div>
  );
}
