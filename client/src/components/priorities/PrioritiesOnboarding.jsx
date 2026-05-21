import { useState } from "react";
import DaleAvatar from "../dale/DaleAvatar";
import DaleDisclaimer from "../dale/DaleDisclaimer";
import Button from "../ui/Button";
import Input, { Label } from "../ui/Input";
import { MAX_PRIORITIES, PRIORITY_CATEGORIES } from "../../constants/priorities";

const EMPTY_SLOT = { category: "input_costs", note: "", selected: false };

export default function PrioritiesOnboarding({ onComplete, onSkip, saving }) {
  const [slots, setSlots] = useState([
    { ...EMPTY_SLOT, category: "input_costs", selected: true },
    { ...EMPTY_SLOT, category: "cash_flow", selected: false },
    { ...EMPTY_SLOT, selected: false }
  ]);

  function toggleSlot(index) {
    setSlots((prev) => {
      const next = [...prev];
      const selectedCount = next.filter((s) => s.selected).length;
      if (!next[index].selected && selectedCount >= MAX_PRIORITIES) return prev;
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  }

  function updateSlot(index, key, value) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value, selected: true };
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const priorities = slots
      .filter((s) => s.selected)
      .map((s) => ({
        category: s.category,
        note: s.note.trim() || undefined,
        source: "onboarding"
      }));
    onComplete?.(priorities);
  }

  const selectedCount = slots.filter((s) => s.selected).length;

  return (
    <div className="mx-auto flex max-w-xl flex-col max-lg:px-0 max-lg:py-2 lg:px-6 lg:py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <DaleAvatar variant="avatar" size="lg" />
        <h1 className="font-display mt-4 text-2xl font-bold text-fm-ink lg:text-3xl">
          What is on your mind this season?
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fm-charcoal lg:text-lg">
          Pick up to three. Dale will focus here first — margins, benchmarks, and local resources when they fit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`rounded-xl border p-4 transition-colors ${
              slot.selected
                ? "border-fm-teal/40 bg-fm-teal-subtle/30"
                : "border-fm-gray-light bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={slot.selected}
                onChange={() => toggleSlot(index)}
                className="mt-1 h-4 w-4 rounded border-fm-gray-medium text-fm-teal focus:ring-fm-teal"
              />
              <span className="flex-1">
                <span className="block text-sm font-bold text-fm-charcoal">Priority {index + 1}</span>
              </span>
            </label>
            {slot.selected && (
              <div className="mt-3 space-y-3 pl-7">
                <div>
                  <Label>Topic</Label>
                  <select
                    className="w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3"
                    value={slot.category}
                    onChange={(e) => updateSlot(index, "category", e.target.value)}
                  >
                    {PRIORITY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Input
                    value={slot.note}
                    onChange={(e) => updateSlot(index, "note", e.target.value)}
                    placeholder="A sentence in your own words..."
                    maxLength={280}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-3 pt-2 max-lg:[&_button]:w-full sm:flex-row sm:flex-wrap">
          <Button type="submit" disabled={saving || selectedCount === 0} className="max-lg:w-full">
            {saving ? "Saving..." : "Save priorities"}
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip} disabled={saving} className="max-lg:w-full">
            Skip for now
          </Button>
        </div>
      </form>

      <DaleDisclaimer className="mt-8" />
    </div>
  );
}
