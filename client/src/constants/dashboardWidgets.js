export const DASHBOARD_WIDGETS = {
  "farm-priorities": {
    id: "farm-priorities",
    label: "Season priorities",
    description: "What you are working on this season",
    span: "full"
  },
  "setup-prompt": {
    id: "setup-prompt",
    label: "Getting started",
    description: "Prompt to add fields and input costs",
    span: "full"
  },
  "dale-briefing": {
    id: "dale-briefing",
    label: "Scenario briefing",
    description: "Key findings from your latest scenario",
    span: "full"
  },
  "metrics-operating-cost": {
    id: "metrics-operating-cost",
    label: "Total operating cost",
    description: "Weighted operating cost per acre",
    span: "metric"
  },
  "metrics-base-margin": {
    id: "metrics-base-margin",
    label: "Base case margin",
    description: "Margin per acre in base scenario",
    span: "metric"
  },
  "metrics-downside-margin": {
    id: "metrics-downside-margin",
    label: "Downside margin",
    description: "Margin per acre in downside scenario",
    span: "metric"
  },
  "metrics-farm-acres": {
    id: "metrics-farm-acres",
    label: "Total farm acres",
    description: "Acres on your farm record",
    span: "metric"
  },
  "countdown-march": {
    id: "countdown-march",
    label: "Days until March 1",
    description: "Countdown to input commitment season",
    span: "metric"
  },
  "quick-actions": {
    id: "quick-actions",
    label: "Quick actions",
    description: "Shortcuts to farm, scenarios, and reports",
    span: "full"
  },
  "dashboard-margin-chart": {
    id: "dashboard-margin-chart",
    label: "Margin Chart",
    description: "A chart showing the base vs. downside margins",
    span: "full"
  },
  "dashboard-cost-chart": {
    id: "dashboard-cost-chart",
    label: "Cost Chart",
    description: "A chart showing the operating cost breakdown",
    span: "full"
  },
  "dashboard-peer-widget": {
    id: "dashboard-peer-widget",
    label: "Regional comparison",
    description: "Where your costs and margins sit among farms like yours",
    span: "full"
  },
  "metrics-peer-position": {
    id: "metrics-peer-position",
    label: "Regional position",
    description: "Margin percentile vs farms in your region",
    span: "metric"
  }
};

export const ALL_WIDGET_IDS = Object.keys(DASHBOARD_WIDGETS);

export function defaultWidgetOrder({ hasFields, hasFindings, hasMetrics, hasPriorities }) {
  const order = [];
  order.push("farm-priorities");
  if (hasFindings) order.push("dale-briefing");
  else if (!hasFields) order.push("setup-prompt");
  if (hasMetrics) {
    order.push(
      "metrics-operating-cost",
      "metrics-base-margin",
      "metrics-downside-margin",
      "metrics-peer-position",
      "metrics-farm-acres",
      "dashboard-peer-widget",
      "dashboard-margin-chart",
      "dashboard-cost-chart"
    );
  }
   order.push("quick-actions");
  return order;
}

export function spanClass(span) {
  if (span === "full") return "col-span-1 sm:col-span-2 lg:col-span-4";
  return "col-span-1 sm:col-span-1 lg:col-span-1";
}
