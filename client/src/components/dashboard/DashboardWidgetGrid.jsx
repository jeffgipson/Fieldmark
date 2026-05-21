import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import SortableDashboardWidget from "./SortableDashboardWidget";

export default function DashboardWidgetGrid({
  widgetIds,
  customizing,
  onReorder,
  onRemoveWidget,
  contentProps
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over) onReorder(active.id, over.id);
  }

  if (widgetIds.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-dashed border-fm-gray-light bg-fm-surface/80 p-8 text-center text-fm-gray-medium">
        No widgets on your dashboard. Use Customize to add some.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetIds} strategy={rectSortingStrategy} disabled={!customizing}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {widgetIds.map((id) => (
            <SortableDashboardWidget
              key={id}
              id={id}
              customizing={customizing}
              onRemove={onRemoveWidget}
              contentProps={contentProps}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
