import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import useAuthenticatedBlobUrl from "../../hooks/useAuthenticatedBlobUrl";
import * as fieldsApi from "../../api/fields";
import { DEFAULT_FARM_COVER_URL } from "../../constants/defaults";
import { friendlyError } from "../../utils/errors";

const MAX_BYTES = 5 * 1024 * 1024;

export default function FieldCoverPhoto({ farmId, field, farm, onUpdated }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fieldCoverPath = field?.cover_photo_path || null;
  const farmCoverPath =
    !fieldCoverPath && (field?.farm_cover_photo_path || farm?.cover_photo_path) || null;

  const { url: fieldUrl, loading: fieldLoading } = useAuthenticatedBlobUrl(fieldCoverPath);
  const { url: farmUrl, loading: farmLoading } = useAuthenticatedBlobUrl(farmCoverPath);

  const hasFieldCover = Boolean(fieldUrl);
  const hasFarmCover = Boolean(farmUrl);
  const displayUrl = fieldUrl || farmUrl || DEFAULT_FARM_COVER_URL;
  const loading = (fieldCoverPath && fieldLoading) || (farmCoverPath && farmLoading && !fieldUrl);
  const usingDefault = !hasFieldCover && !hasFarmCover;

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
      const updated = await fieldsApi.uploadFieldCoverPhoto(farmId, field.id, file);
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
    if (!hasFieldCover) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await fieldsApi.removeFieldCoverPhoto(farmId, field.id);
      onUpdated?.(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
    }
  }

  const uploadLabel = hasFieldCover
    ? "Change field photo"
    : hasFarmCover
      ? "Add field photo"
      : "Add field photo";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative block h-44 w-full overflow-hidden bg-gradient-to-br from-fm-teal/25 via-fm-teal-subtle to-fm-gold/25 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fm-teal/50"
        aria-label={hasFieldCover ? "Change field cover photo" : "Upload field cover photo"}
      >
        {loading && (
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
          {uploading ? "Uploading…" : uploadLabel}
        </span>
        {usingDefault && (
          <span className="absolute right-4 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            Farm default
          </span>
        )}
        {!hasFieldCover && hasFarmCover && (
          <span className="absolute right-4 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            From farm
          </span>
        )}
        <span className="absolute inset-0 bg-fm-charcoal/0 transition group-hover:bg-fm-charcoal/10" />
      </button>

      {hasFieldCover && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-fm-charcoal/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-fm-charcoal"
          aria-label="Remove field cover photo"
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
