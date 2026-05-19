export const VENDOR_CATEGORIES = [
  { value: "ag_lender", label: "Ag lender" },
  { value: "seed_dealer", label: "Seed dealer" },
  { value: "farm_store_coop", label: "Farm store / co-op" },
  { value: "fertilizer_chemical", label: "Fertilizer & chemical" },
  { value: "crop_insurance", label: "Crop insurance" },
  { value: "grain_merchandiser", label: "Grain merchandiser" },
  { value: "equipment_dealer", label: "Equipment dealer" },
  { value: "farm_accounting", label: "Farm accounting" },
  { value: "custom_applicator", label: "Custom applicator" },
  { value: "agronomist", label: "Agronomist" },
  { value: "farm_attorney", label: "Farm attorney" },
  { value: "other", label: "Other" }
];

export function categoryLabel(value) {
  return VENDOR_CATEGORIES.find((c) => c.value === value)?.label || value;
}
