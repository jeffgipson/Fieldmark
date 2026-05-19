import { Fragment, useEffect, useId, useRef, useState } from "react";
import { Pencil } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-fm-teal/40 bg-white px-2 py-1 text-sm font-semibold text-fm-charcoal shadow-sm focus:border-fm-teal focus:outline-none focus:ring-2 focus:ring-fm-teal/20";

export default function InlineEditable({
  label,
  value,
  displayValue,
  type = "text",
  options,
  suffix,
  placeholder = "Click to edit",
  onSave,
  className = "",
  inputClassName = "",
  definitionList = true
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (type !== "select") inputRef.current.select();
    }
  }, [editing, type]);

  const shown = displayValue ?? (value != null && value !== "" ? String(value) : null);

  async function commit() {
    const next = type === "number" ? String(draft).trim() : String(draft).trim();
    const prev = value != null ? String(value) : "";
    if (next === prev) {
      setEditing(false);
      setError(null);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(next);
      setEditing(false);
    } catch (err) {
      setError(err?.message || "Could not save");
      setDraft(value ?? "");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(value ?? "");
    setError(null);
    setEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  const Wrapper = className ? "div" : Fragment;
  const wrapperProps = className ? { className } : {};
  const LabelTag = definitionList ? "dt" : "p";
  const ValueTag = definitionList ? "dd" : "div";

  return (
    <Wrapper {...wrapperProps}>
      {label && (
        <LabelTag className="text-xs font-bold uppercase text-fm-gray-medium">
          <label htmlFor={editing ? inputId : undefined}>{label}</label>
        </LabelTag>
      )}
      <ValueTag className={definitionList ? "mt-0.5 min-h-[1.75rem]" : "mt-1 min-h-[1.75rem]"}>
        {editing ? (
          <div className="space-y-1">
            {type === "select" && options ? (
              <select
                id={inputId}
                ref={inputRef}
                className={`${inputClass} ${inputClassName}`}
                value={draft}
                disabled={saving}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={onKeyDown}
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  id={inputId}
                  ref={inputRef}
                  type={type}
                  step={type === "number" ? "0.1" : undefined}
                  className={`${inputClass} ${inputClassName}`}
                  value={draft}
                  disabled={saving}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={onKeyDown}
                />
                {suffix && <span className="text-sm text-fm-gray-medium">{suffix}</span>}
              </div>
            )}
            {saving && <p className="text-xs text-fm-gray-medium">Saving…</p>}
            {error && <p className="text-xs text-fm-alert">{error}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left font-semibold text-fm-charcoal transition hover:border-fm-teal/15 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-teal/30"
            title="Click to edit"
          >
            <span className={shown ? "text-fm-ink" : "italic text-fm-gray-medium"}>
              {shown ?? placeholder}
              {shown && suffix ? ` ${suffix}` : ""}
            </span>
            <Pencil
              className="h-3.5 w-3.5 shrink-0 text-fm-teal opacity-0 transition group-hover:opacity-100"
              aria-hidden
            />
          </button>
        )}
      </ValueTag>
    </Wrapper>
  );
}
