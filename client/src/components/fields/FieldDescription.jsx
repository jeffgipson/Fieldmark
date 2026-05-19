import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import * as fieldsApi from "../../api/fields";
import Button from "../ui/Button";
import { friendlyError } from "../../utils/errors";

export default function FieldDescription({ farmId, field, onFieldChange }) {
  const [draft, setDraft] = useState(field?.description || "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft(field?.description || "");
  }, [field?.description, field?.id]);

  async function saveDescription(text) {
    const trimmed = text.trim();
    if (trimmed === (field?.description || "").trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onFieldChange({ description: trimmed || null });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const updated = await fieldsApi.generateFieldDescription(farmId, field.id);
      setDraft(updated.description || "");
      onFieldChange(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="border-t border-fm-gray-light/80 px-5 py-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-fm-gray-medium">
            About this field
          </p>
          <p className="mt-0.5 text-xs text-fm-gray-medium">
            Describe the field for your records — edit anytime.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="!rounded-lg !px-3 !py-2 !text-xs"
          onClick={handleGenerate}
          disabled={generating || saving}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {generating ? "Writing…" : "Draft with AI"}
        </Button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => saveDescription(draft)}
        rows={4}
        placeholder="e.g. East 65 is our primary corn ground — well-drained silt loam, tiled in 2018…"
        className="w-full resize-y rounded-xl border border-fm-input-border/80 bg-white px-4 py-3 text-sm leading-relaxed text-fm-charcoal shadow-sm placeholder:text-fm-gray-medium focus:border-fm-teal focus:outline-none focus:ring-2 focus:ring-fm-teal/15"
      />
      {(saving || error) && (
        <p className={`mt-2 text-xs ${error ? "text-fm-alert" : "text-fm-gray-medium"}`}>
          {error || "Saving…"}
        </p>
      )}
    </section>
  );
}
