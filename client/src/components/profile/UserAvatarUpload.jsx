import { useRef, useState } from "react";
import { Camera, Loader2, User, X } from "lucide-react";
import useAuthenticatedBlobUrl from "../../hooks/useAuthenticatedBlobUrl";
import * as profileApi from "../../api/profile";
import { friendlyError } from "../../utils/errors";

const MAX_BYTES = 2 * 1024 * 1024;

function initials(firstName, lastName) {
  const a = firstName?.[0] || "";
  const b = lastName?.[0] || "";
  return (a + b).toUpperCase() || "?";
}

export default function UserAvatarUpload({ profile, onUpdated }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { url: imageUrl, loading } = useAuthenticatedBlobUrl(profile?.avatar_path);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const updated = await profileApi.uploadAvatar(file);
      onUpdated?.(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setUploading(true);
    setError(null);
    try {
      const updated = await profileApi.removeAvatar();
      onUpdated?.(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-fm-teal/30 bg-fm-sage/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-teal/40"
          aria-label={imageUrl ? "Change avatar" : "Upload avatar"}
        >
          {loading || uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-fm-teal" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-2xl font-bold text-fm-teal">
              {initials(profile?.first_name, profile?.last_name)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
            <Camera className="text-white" size={24} />
          </span>
        </button>
        {imageUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1 -top-1 rounded-full bg-fm-alert p-1 text-white shadow"
            aria-label="Remove avatar"
          >
            <X size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-fm-charcoal">Profile photo</p>
        <p className="mt-1 text-sm text-fm-gray-medium">JPEG, PNG, or WebP up to 2 MB</p>
        {!imageUrl && !loading && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 text-sm font-bold text-fm-teal hover:underline"
            >
              Upload photo
            </button>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-fm-gray-medium sm:justify-start">
              <User size={14} /> Default shows your initials
            </p>
          </>
        )}
        {error && <p className="mt-2 text-sm text-fm-alert">{error}</p>}
      </div>
    </div>
  );
}
