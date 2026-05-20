import { BRAND } from "./brand";

export const DALE_IMAGES = {
  avatar: "/images/dale/dale-avatar.png",
  sitting: "/images/dale/dale-sitting.png",
  standing: "/images/dale/dale-standing.png",
  analyzing: "/images/dale/dale-analyzing.png",
  waving: "/images/dale/dale-waving.png"
};

export const DALE_VARIANTS = { ...DALE_IMAGES };

export const DALE_COLORS = {
  teal: BRAND.colors.teal,
  tealDark: BRAND.colors.tealHover,
  gold: BRAND.colors.gold,
  cream: BRAND.colors.cream,
  ink: BRAND.colors.charcoal,
  slate: BRAND.colors.grayMedium
};

export const DALE_COPY = {
  name: "D.A.L.E.",
  fullName: "Data Analytics for Land Economics",
  tagline: "Your independent agricultural financial analyst",
  disclaimer: BRAND.attribution.dale,
  emptyState: {
    message: "Add your input costs and I'll tell you where you stand before March.",
    cta: "Add your first field"
  },
  welcome: {
    title: "Meet D.A.L.E.",
    message:
      "I'm D.A.L.E. — Data Analytics for Land Economics. I have no relationship with any input vendor, co-op, or agronomist. My only job is to show you what your numbers actually say — before March.",
    liveResearchNote:
      "When live research is enabled, I also read cited USDA and drought-monitor context for your region — your margin math still comes from your farm data."
  },
  briefingCard: {
    header: "Dale has reviewed this scenario",
    subline: "Your costs, peers, and live regional USDA context when available.",
    cta: "Talk to Dale"
  },
  loading: "Looking at your numbers...",
  report: {
    header: {
      preparedBy: "Analysis prepared by D.A.L.E.",
      subtitle: "Data Analytics for Land Economics",
      attribution: "Fieldmark Agricultural Intelligence"
    },
    generating: "Putting together your lender report...",
    ready: "Your lender report is ready",
    steps: {
      pending: "Request queued — waiting for Dale to start…",
      processing: "Dale is drafting your lender narrative…",
      comparing: "Comparing your costs…",
      finishing: "Polishing the executive summary…"
    },
    sidekiqHint:
      "Still waiting? Start the background worker in another terminal: cd api && bin/jobs"
  },
  error:
    "I'm having trouble pulling your analysis right now. Give it a minute and try again.",
  decisionHelp: {
    button: "I need help",
    prompt:
      "I'm on the decision log for this scenario and I'm not sure what to record. Walk me through whether to proceed, wait, modify my plan, or pass — using my base and downside margins, benchmarks, and peer comparison. Ask me one question at a time until we agree on what fits, then tell me exactly what to select in the form.",
    suggestions: [
      "What does my downside margin say about locking in now?",
      "When would waiting make sense for my numbers?",
      "How do my costs compare to peers for this call?",
      "What should I tell my lender either way?"
    ]
  }
};
