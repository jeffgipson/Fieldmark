import { useEffect, useState } from "react";
import * as decisionsApi from "../../api/decisions";
import * as vendorsApi from "../../api/vendors";
import { useDaleChat } from "../../contexts/DaleChatContext";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input, { Label } from "../ui/Input";
import { DALE_COPY, DALE_IMAGES } from "../../constants/dale";
import { VENDOR_CATEGORIES } from "../../constants/vendors";
import { friendlyError } from "../../utils/errors";

const DECISION_TYPES = [
  { value: "proceed", label: "Proceed" },
  { value: "wait", label: "Wait" },
  { value: "modify", label: "Modify plan" },
  { value: "cancel", label: "Cancel / pass" }
];

const FIELD_STANCES = [
  { value: "proceed", label: "Proceed as planned" },
  { value: "modify", label: "Modify inputs" },
  { value: "wait", label: "Wait / defer" }
];

export default function DecisionLogForm({ scenarioId, initialDecision, onSaved, fields = [], fieldRows = [] }) {
  const { openChat } = useDaleChat();
  const [form, setForm] = useState({
    decision_type: "proceed",
    notes: "",
    vendor_category: "",
    vendor_id: "",
    vendor_contact_notes: ""
  });
  const [fieldNotes, setFieldNotes] = useState({});
  const [vendors, setVendors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const displayFields = fieldRows?.length
    ? fieldRows.map((r) => ({ id: r.field_id, name: r.field_name }))
    : fields.map((f) => ({ id: f.id, name: f.name }));

  useEffect(() => {
    if (initialDecision) {
      setForm({
        decision_type: initialDecision.decision_type || "proceed",
        notes: initialDecision.notes || "",
        vendor_category: initialDecision.vendor_category || "",
        vendor_id: initialDecision.vendor_id ? String(initialDecision.vendor_id) : "",
        vendor_contact_notes: initialDecision.vendor_contact_notes || ""
      });
      const notesMap = {};
      (initialDecision.field_notes || []).forEach((row) => {
        notesMap[row.field_id] = { stance: row.stance || "proceed", note: row.note || "" };
      });
      setFieldNotes(notesMap);
    }
  }, [initialDecision]);

  useEffect(() => {
    vendorsApi.listVendors().then(setVendors).catch(() => {});
  }, []);

  function updateFieldNote(fieldId, key, value) {
    setFieldNotes((prev) => ({
      ...prev,
      [fieldId]: { ...(prev[fieldId] || { stance: "proceed", note: "" }), [key]: value }
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        decision_type: form.decision_type,
        notes: form.notes,
        vendor_category: form.vendor_category || null,
        vendor_id: form.vendor_id ? Number(form.vendor_id) : null,
        vendor_contact_notes: form.vendor_contact_notes || null,
        decided_at: new Date().toISOString(),
        field_notes: displayFields.map((f) => ({
          field_id: f.id,
          stance: fieldNotes[f.id]?.stance || "proceed",
          note: fieldNotes[f.id]?.note || ""
        }))
      };
      if (initialDecision) {
        await decisionsApi.updateDecision(scenarioId, payload);
      } else {
        await decisionsApi.createDecision(scenarioId, payload);
      }
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  const filteredVendors = form.vendor_category
    ? vendors.filter((v) => v.category === form.vendor_category)
    : vendors;

  function handleNeedHelp() {
    openChat({
      scenarioId: Number(scenarioId),
      initialMessage: DALE_COPY.decisionHelp.prompt,
      intent: "decision_help"
    });
  }

  return (
    <Card className="mt-8">
      <h3 className="font-display text-lg font-semibold">Log your decision</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Record what you decided for the farm and note where individual fields differ.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Farm decision</Label>
          <select
            className="fm-input w-full"
            value={form.decision_type}
            onChange={(e) => setForm({ ...form, decision_type: e.target.value })}
          >
            {DECISION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {displayFields.length > 0 && (
          <div className="rounded-lg border border-fm-gray-light p-4">
            <p className="text-sm font-semibold text-fm-charcoal">By field</p>
            <p className="mt-1 text-xs text-fm-gray-medium">
              Your farm decision is above — capture where fields need a different approach.
            </p>
            <ul className="mt-3 space-y-3">
              {displayFields.map((f) => (
                <li key={f.id} className="grid gap-2 sm:grid-cols-2">
                  <span className="text-sm font-medium sm:col-span-2">{f.name}</span>
                  <select
                    className="fm-input w-full text-sm"
                    value={fieldNotes[f.id]?.stance || "proceed"}
                    onChange={(e) => updateFieldNote(f.id, "stance", e.target.value)}
                  >
                    {FIELD_STANCES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <Input
                    value={fieldNotes[f.id]?.note || ""}
                    onChange={(e) => updateFieldNote(f.id, "note", e.target.value)}
                    placeholder="Field note (optional)"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <Label>Vendor category (optional)</Label>
          <select
            className="fm-input w-full"
            value={form.vendor_category}
            onChange={(e) => setForm({ ...form, vendor_category: e.target.value, vendor_id: "" })}
          >
            <option value="">—</option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Vendor from directory (optional)</Label>
          <select
            className="fm-input w-full"
            value={form.vendor_id}
            onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
          >
            <option value="">—</option>
            {filteredVendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Who you talked to (optional)</Label>
          <Input
            value={form.vendor_contact_notes}
            onChange={(e) => setForm({ ...form, vendor_contact_notes: e.target.value })}
            placeholder="e.g. spoke with lender about operating line"
          />
        </div>
        <div>
          <Label>Notes</Label>
          <textarea
            className="fm-input w-full min-h-[80px]"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save decision"}</Button>
          <Button
            type="button"
            variant="secondary"
            className="!py-2.5"
            onClick={handleNeedHelp}
          >
            <img src={DALE_IMAGES.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
            {DALE_COPY.decisionHelp.button}
          </Button>
        </div>
        {saved && <p className="text-sm text-fm-success">Decision saved.</p>}
        {error && <p className="text-sm text-fm-alert">{error}</p>}
      </form>
    </Card>
  );
}
