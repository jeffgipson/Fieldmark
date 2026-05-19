import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_WIDGET_IDS,
  DASHBOARD_WIDGETS,
  defaultWidgetOrder
} from "../constants/dashboardWidgets";

const STORAGE_VERSION = "v1";

function storageKey(userId) {
  return `fieldmark.dashboard.${STORAGE_VERSION}.${userId || "guest"}`;
}

function loadLayout(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((id) => DASHBOARD_WIDGETS[id]);
  } catch {
    return null;
  }
}

function hasStoredLayout(userId) {
  try {
    return localStorage.getItem(storageKey(userId)) != null;
  } catch {
    return false;
  }
}

function saveLayout(userId, widgetIds) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(widgetIds));
  } catch {
    /* ignore quota / private mode */
  }
}

function insertWidget(prev, id) {
  if (prev.includes(id)) return prev;
  const quickIdx = prev.indexOf("quick-actions");
  if (quickIdx >= 0) {
    const next = [...prev];
    next.splice(quickIdx, 0, id);
    return next;
  }
  const prioritiesIdx = prev.indexOf("farm-priorities");
  if (prioritiesIdx >= 0) {
    const next = [...prev];
    next.splice(prioritiesIdx + 1, 0, id);
    return next;
  }
  return [...prev, id];
}

export default function useDashboardLayout(userId, defaults, dataReady = true) {
  const [widgetIds, setWidgetIds] = useState(() => {
    const saved = loadLayout(userId);
    if (saved?.length) return saved;
    return defaultWidgetOrder(defaults);
  });
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    const saved = loadLayout(userId);
    if (saved?.length) {
      setWidgetIds(saved);
    }
  }, [userId]);

  useEffect(() => {
    if (!dataReady) return;
    if (hasStoredLayout(userId)) return;
    setWidgetIds(defaultWidgetOrder(defaults));
  }, [
    userId,
    dataReady,
    defaults.hasFields,
    defaults.hasFindings,
    defaults.hasMetrics
  ]);

  useEffect(() => {
    if (!dataReady) return;
    if (!defaults.hasMetrics) return;
    setWidgetIds((prev) => prev.filter((id) => id !== "setup-prompt"));
  }, [dataReady, defaults.hasMetrics]);

  useEffect(() => {
    if (!dataReady) return;
    saveLayout(userId, widgetIds);
  }, [userId, widgetIds, dataReady]);

  const reorder = useCallback((activeId, overId) => {
    if (!overId || activeId === overId) return;
    setWidgetIds((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const next = [...prev];
      next.splice(oldIndex, 1);
      next.splice(newIndex, 0, activeId);
      return next;
    });
  }, []);

  const addWidget = useCallback(
    (id) => {
      if (!DASHBOARD_WIDGETS[id]) return;
      if (id === "setup-prompt" && defaults.hasMetrics) return;
      setWidgetIds((prev) => insertWidget(prev, id));
    },
    [defaults.hasMetrics]
  );

  const removeWidget = useCallback((id) => {
    setWidgetIds((prev) => prev.filter((w) => w !== id));
  }, []);

  const resetLayout = useCallback(() => {
    setWidgetIds(defaultWidgetOrder(defaults));
  }, [defaults.hasFields, defaults.hasFindings, defaults.hasMetrics]);

  const availableToAdd = useMemo(
    () =>
      ALL_WIDGET_IDS.filter((id) => {
        if (widgetIds.includes(id)) return false;
        if (id === "setup-prompt" && defaults.hasMetrics) return false;
        return true;
      }),
    [widgetIds, defaults.hasMetrics]
  );

  return {
    widgetIds,
    customizing,
    setCustomizing,
    reorder,
    addWidget,
    removeWidget,
    resetLayout,
    availableToAdd
  };
}
