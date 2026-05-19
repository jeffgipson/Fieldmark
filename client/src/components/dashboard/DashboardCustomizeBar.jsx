import { LayoutGrid, Plus, RotateCcw } from "lucide-react";
import { DASHBOARD_WIDGETS } from "../../constants/dashboardWidgets";
import Button from "../ui/Button";

export default function DashboardCustomizeBar({
  customizing,
  onToggleCustomize,
  availableToAdd,
  onAddWidget,
  onReset
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <Button
        variant={customizing ? "primary" : "secondary"}
        className="!py-2.5"
        onClick={onToggleCustomize}
      >
        <LayoutGrid size={18} />
        {customizing ? "Done customizing" : "Customize dashboard"}
      </Button>

      {customizing && (
        <div className="fm-card flex-1 p-4 sm:max-w-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-fm-gray-medium">
            Add widgets
          </p>
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
      )}
    </div>
  );
}
