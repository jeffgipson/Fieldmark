import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import * as prioritiesApi from "../../api/priorities";
import Button from "../ui/Button";
import Input, { Label } from "../ui/Input";
import { MAX_PRIORITIES, PRIORITY_CATEGORIES, categoryLabel } from "../../constants/priorities";
import { friendlyError } from "../../utils/errors";

export default function FarmPrioritiesEditor({
  farmId,
  priorities = [],
  onChange,
  compact = false
}) {
  const active = priorities.filter((p) => p.status === "active");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ category: "input_costs", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleAdd(e) {
    e?.preventDefault?.();
    if (active.length >= MAX_PRIORITIES) return;
    setSaving(true);
    setError(null);
    try {
      const created = await prioritiesApi.createPriority(farmId, {
        ...form,
        source: "user"
      });
      onChange?.([created, ...priorities.filter((p) => p.id !== created.id)]);
      setForm({ category: "input_costs", note: "" });
      setAdding(false);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleResolve(id) {
    setSaving(true);
    setError(null);
    try {
      const updated = await prioritiesApi.updatePriority(farmId, id, { status: "resolved" });
      onChange?.(priorities.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setSaving(true);
    setError(null);
    try {
      await prioritiesApi.deletePriority(farmId, id);
      onChange?.(priorities.filter((p) => p.id !== id));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "" : "space-y-4"}>
      {active.length === 0 && !adding && (
        <p className="text-sm text-fm-gray-medium">
          Tell us what you are working through this season. Dale and your dashboard will focus here first.
        </p>
      )}

      <ul className="space-y-3">
        {active.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-fm-gray-light/80 bg-white px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-fm-charcoal">
                  {p.category_label || categoryLabel(p.category)}
                </p>
                {p.note && <p className="mt-1 text-sm text-fm-gray-medium">{p.note}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => handleResolve(p.id)}
                  disabled={saving}
                  className="rounded-lg p-2 text-fm-teal hover:bg-fm-teal-subtle"
                  title="Mark resolved"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={saving}
                  className="rounded-lg p-2 text-fm-gray-medium hover:bg-fm-gray-light/80"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {active.length < MAX_PRIORITIES && !adding && (
        <Button type="button" variant="secondary" onClick={() => setAdding(true)}>
          <Plus size={16} className="mr-1" />
          Add priority
        </Button>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-fm-teal/20 bg-fm-teal-subtle/20 p-4">
          <div className="grid gap-3">
            <div>
              <Label>What are you working on?</Label>
              <select
                className="w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {PRIORITY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-fm-gray-medium">
                {PRIORITY_CATEGORIES.find((c) => c.value === form.category)?.hint}
              </p>
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="In your own words..."
                maxLength={280}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-fm-alert">{error}</p>}
      {!compact && active.length > 0 && (
        <p className="text-xs text-fm-gray-medium">
          Dale uses these when you chat. Resources may suggest local partners when relevant — never in Dale&apos;s voice.
        </p>
      )}
    </div>
  );
}
