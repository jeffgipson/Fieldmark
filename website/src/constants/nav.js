/** Primary site navigation — anchor links use /# so they work from any page. */
export const MAIN_NAV = [
  { label: "Solutions", to: "/#solutions" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Blog", to: "/blog" },
  { label: "Analyst", to: "/#dale" },
  { label: "Farmers", to: "/#stories" },
  { label: "Developers", to: "/developer" }
];

export function isNavItemActive(pathname, to) {
  if (to.startsWith("/#")) return false;
  if (to === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function isHashNav(to) {
  return to.startsWith("/#");
}
