import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import useAuthenticatedBlobUrl from "../../hooks/useAuthenticatedBlobUrl";
import * as farmsApi from "../../api/farms";
import { DEFAULT_FARM_COVER_URL } from "../../constants/defaults";
import { friendlyError } from "../../utils/errors";

const MAX_BYTES = 5 * 1024 * 1024;

export default function FarmCoverPhoto({ farm, onUpdated, className = "" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { url: customUrl, loading } = useAuthenticatedBlobUrl(farm?.cover_photo_path);
  const displayUrl = customUrl || DEFAULT_FARM_COVER_URL;
  const hasCustom = Boolean(customUrl);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const updated = await farmsApi.uploadFarmCoverPhoto(farm.id, file);
      onUpdated?.(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(e) {
    e.stopPropagation();
    setUploading(true);
    setError(null);
    try {
      const updated = await farmsApi.removeFarmCoverPhoto(farm.id);
      onUpdated?.(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative block h-40 w-full overflow-hidden rounded-t-[var(--radius-fm-lg)] bg-fm-teal-subtle text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fm-teal/50"
        aria-label={hasCustom ? "Change farm cover photo" : "Upload farm cover photo"}
      >
        {loading && hasCustom && (
          <span className="absolute inset-0 z-10 flex items-center justify-center bg-fm-charcoal/25">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </span>
        )}
        <img
          src={displayUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fm-charcoal/55 via-fm-charcoal/5 to-transparent" />
        <span className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          <Camera size={14} aria-hidden />
          {uploading ? "Uploading…" : hasCustom ? "Change farm photo" : "Set farm cover photo"}
        </span>
        {!hasCustom && (
          <span className="absolute right-4 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            Default
          </span>
        )}
        <span className="absolute inset-0 bg-fm-charcoal/0 transition group-hover:bg-fm-charcoal/10" />
      </button>

      {hasCustom && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-fm-charcoal/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-fm-charcoal"
          aria-label="Remove farm cover photo"
        >
          <X size={16} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && (
        <p className="absolute bottom-0 left-0 right-0 z-10 bg-fm-alert/95 px-3 py-1.5 text-center text-xs text-white">
          {error}
        </p>
      )}
    </div>
  );
}
