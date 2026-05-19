export const SCENARIO_COPY = {
  page: {
    eyebrow: "Margin planning",
    title: "Your scenarios",
    subtitle:
      "See what you could earn — and what you might lose — before you commit to March inputs. Work through the steps below; each one builds on the last."
  },
  journey: {
    title: "Your path before March",
    steps: [
      {
        id: "costs",
        label: "Enter field costs",
        description: "Seed, fertilizer, and other inputs per acre on each field."
      },
      {
        id: "margins",
        label: "Run your margin model",
        description: "Set price and yield for a normal year and a tougher year."
      },
      {
        id: "benchmark",
        label: "Compare to regional peers",
        description: "See how your costs stack up against Extension benchmarks."
      },
      {
        id: "report",
        label: "Lender report (optional)",
        description: "Generate a summary you can share with your lender or advisor."
      }
    ]
  },
  empty: {
    title: "Start with your first scenario",
    body:
      "Most farmers begin with a base case for the planning year — then we model a downside year on the same plan so you know your floor.",
    cta: "Create base case scenario"
  },
  create: {
    defaultName: "Base Case 2026",
    downsideName: "Downside review",
    label: "Scenario name",
    hint: "Use a name you will recognize later, like “Base Case 2026” or “Lender meeting draft”.",
    submit: "Create scenario",
    addAnother: "Add another scenario"
  },
  card: {
    needsCalculation: {
      title: "Margins not calculated yet",
      body: "Open this scenario, confirm your price and yield assumptions, then run the calculator.",
      cta: "Run margin model"
    },
    needsBenchmark: {
      title: "Margins are ready",
      body: "Next, compare your input costs to regional peers so you know where you stand.",
      cta: "Compare to peers"
    },
    ready: {
      ctaMargins: "View margins",
      ctaBenchmark: "Cost comparison",
      ctaReport: "Lender report"
    }
  }
};
