import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { DASHBOARD_WIDGETS, spanClass } from "../../constants/dashboardWidgets";
import DashboardWidgetContent from "./DashboardWidgetContent";

export default function SortableDashboardWidget({
  id,
  customizing,
  onRemove,
  contentProps
}) {
  const meta = DASHBOARD_WIDGETS[id];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  if (!meta) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative min-h-0 ${spanClass(meta.span)} ${isDragging ? "z-20 opacity-90" : ""}`}
    >
      {customizing && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-dashed border-fm-teal/40 bg-fm-teal-subtle/60 px-2 py-1.5">
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 text-left text-xs font-semibold text-fm-teal active:cursor-grabbing"
            aria-label={`Drag ${meta.label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="shrink-0" />
            <span className="truncate">{meta.label}</span>
          </button>
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="rounded-md p-1 text-fm-gray-medium hover:bg-fm-surface hover:text-fm-alert"
            aria-label={`Remove ${meta.label}`}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className={customizing ? "pointer-events-none select-none" : ""}>
        <DashboardWidgetContent widgetId={id} {...contentProps} />
      </div>
    </div>
  );
}
