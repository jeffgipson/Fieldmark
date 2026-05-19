/** Farmer subscription tiers — keep in sync with api/app/models/subscription_plan.rb */
export const PRICING_PLANS = [
  {
    key: "basic",
    name: "Basic",
    priceMonthly: 30,
    description: "One farm, up to five fields — everything you need for a single operation.",
    highlighted: false,
    cta: "Get started",
    features: [
      "1 farm",
      "Up to 5 fields",
      "Extension peer benchmarks",
      "Scenario modeling (base & downside)",
      "Talk to Dale — independent analyst",
      "Lender-ready reports"
    ]
  },
  {
    key: "pro",
    name: "Pro",
    priceMonthly: 50,
    description: "Multiple farms and unlimited fields for growers managing more than one operation.",
    highlighted: true,
    cta: "Start with Pro",
    features: [
      "Multiple farms",
      "Unlimited fields",
      "Everything in Basic",
      "Switch between farms in one account",
      "Priority for multi-location planning"
    ]
  }
];
