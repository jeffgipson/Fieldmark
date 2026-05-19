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
  name: "Dale",
  tagline: "Your independent analyst",
  disclaimer: BRAND.attribution.dale,
  emptyState: {
    message: "Add your input costs and I'll tell you where you stand before March.",
    cta: "Add your first field"
  },
  welcome: {
    title: "Meet Dale",
    message:
      "I'm Dale — your independent analyst. I've already looked at how Missouri farms your size plan for March inputs. Once you enter your costs, I'll show you where you stand against regional benchmarks and what your margin looks like in a downside year."
  },
  loading: "Looking at your numbers...",
  briefingCard: {
    header: "Dale has reviewed this scenario",
    cta: "Talk to Dale"
  },
  report: {
    generating: "Putting together your lender report...",
    ready: "Your lender report is ready"
  },
  error:
    "I'm having trouble pulling your analysis right now. Give it a minute and try again."
};
