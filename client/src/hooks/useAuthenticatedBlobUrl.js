import { useEffect, useState } from "react";
import http from "../api/http";

/** Load a JWT-protected API path as a blob object URL (for img src). */
export default function useAuthenticatedBlobUrl(path) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return undefined;
    }

    let objectUrl;
    let cancelled = false;
    setLoading(true);

    http
      .get(path, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return { url, loading };
}
