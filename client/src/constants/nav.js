import {
  BarChart2,
  FileText,
  Handshake,
  LayoutDashboard,
  Plug,
  Sprout,
  TrendingUp
} from "lucide-react";

export const MAIN_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/farm", label: "My Farm", icon: Sprout, end: true },
  { to: "/scenarios", label: "Scenarios", icon: TrendingUp, end: true }
];

export const TOOLS_NAV = [
  { to: "/reports", label: "Reports", icon: FileText, end: true },
  { to: "/resources", label: "Resources", icon: Handshake, end: true },
  { to: "/integrations", label: "Integrations", icon: Plug, end: true }
];

/** Bottom tab bar — mobile only (< lg). */
export const MOBILE_TAB_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/farm", label: "Farm", icon: Sprout, end: true },
  { to: "/scenarios", label: "Scenarios", icon: TrendingUp, end: true }
];
