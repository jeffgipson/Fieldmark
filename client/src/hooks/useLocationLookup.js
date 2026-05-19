import { useCallback, useEffect, useRef, useState } from "react";
import * as locationsApi from "../api/locations";
import { friendlyError } from "../utils/errors";

export default function useLocationLookup({ latitude, longitude, boundary, enabled = true }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const boundaryKey = boundary ? JSON.stringify(boundary) : null;

  const lookup = useCallback(async () => {
    if (!enabled || latitude == null || longitude == null) return;

    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await locationsApi.lookupLocation({
        latitude,
        longitude,
        boundary: boundaryKey ? JSON.parse(boundaryKey) : undefined
      });
      if (id === requestId.current) setInsights(data);
    } catch (err) {
      if (id === requestId.current) {
        setError(friendlyError(err));
        setInsights(null);
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [enabled, latitude, longitude, boundaryKey]);

  useEffect(() => {
    const timer = setTimeout(lookup, boundaryKey ? 400 : 300);
    return () => clearTimeout(timer);
  }, [lookup, boundaryKey]);

  return { insights, loading, error, refresh: lookup };
}
