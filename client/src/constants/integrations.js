import {
  BarChart2,
  Bot,
  Cloud,
  Code2,
  Database,
  FileSpreadsheet,
  Map,
  Plug,
  Sprout,
  Tractor,
  Wallet
} from "lucide-react";
import { developerPath } from "../lib/appUrls";

/** Client-only: icons and in-app links keyed by integration slug. */
export const INTEGRATION_UI = {
  mu_extension: { icon: BarChart2, href: null },
  usda_nass: { icon: Database, href: null },
  macro_drivers: { icon: BarChart2, href: null },
  dale: { icon: Bot, href: null, action: "dale" },
  google_maps: { icon: Map, href: "/farm" },
  regrid: { icon: Map, href: "/farm" },
  openstreetmap: { icon: Map, href: "/farm" },
  csv_history: { icon: FileSpreadsheet, href: "/scenarios" },
  fieldmark_api: { icon: Code2, href: developerPath(), external: true },
  stripe: { icon: Wallet, href: "/profile#billing" },
  sendgrid: { icon: Cloud, href: null },
  live_bls: { icon: Database, href: null },
  live_usda_risk: { icon: Database, href: null },
  john_deere: { icon: Tractor, href: null },
  climate_fieldview: { icon: Sprout, href: null },
  quickbooks: { icon: Wallet, href: null },
  cme_prices: { icon: BarChart2, href: null }
};

export const STATUS_LABELS = {
  active: "Active",
  in_progress: "In progress",
  planned: "Planned"
};

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In progress" },
  { value: "planned", label: "Planned" }
];

export const DEFAULT_CATEGORY_LABEL = "Other";
