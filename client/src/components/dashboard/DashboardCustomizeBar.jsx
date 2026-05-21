import { LayoutGrid, Plus, RotateCcw } from "lucide-react";
import { DASHBOARD_WIDGETS } from "../../constants/dashboardWidgets";

export function DashboardCustomizeToggle({ customizing, onToggleCustomize }) {
  return (
    <button
      type="button"
      onClick={onToggleCustomize}
      aria-pressed={customizing}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-teal/40 focus-visible:ring-offset-2 ${
        customizing
          ? "bg-fm-teal text-white shadow-sm hover:bg-fm-teal-hover"
          : "text-fm-teal hover:bg-fm-teal-subtle"
      }`}
    >
      <LayoutGrid size={16} strokeWidth={2} aria-hidden />
      {customizing ? "Done" : "Customize"}
    </button>
  );
}

export default function DashboardCustomizePanel({
  customizing,
  availableToAdd,
  onAddWidget,
  onReset
}) {
  if (!customizing) return null;

  return (
    <div className="mb-4 fm-card p-4 lg:mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-fm-gray-medium">Add widgets</p>
      {availableToAdd.length === 0 ? (
        <p className="mt-2 text-sm text-fm-gray-medium">All widgets are on your dashboard.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {availableToAdd.map((id) => {
            const meta = DASHBOARD_WIDGETS[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onAddWidget(id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fm-gray-light bg-fm-surface px-3 py-2 text-sm font-semibold text-fm-charcoal transition hover:border-fm-teal/40 hover:bg-fm-teal-subtle"
                >
                  <Plus size={14} />
                  {meta.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-fm-teal hover:underline"
      >
        <RotateCcw size={14} />
        Reset to suggested layout
      </button>
    </div>
  );
}
