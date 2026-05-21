import { useEffect } from "react";
import { NavLink, useMatch } from "react-router-dom";
import { BarChart2, LifeBuoy, UserCircle, X } from "lucide-react";
import { BRAND } from "../../constants/brand";
import { TOOLS_NAV } from "../../constants/nav";
import { useFarm } from "../../contexts/FarmContext";
import InstallAppMenuItem from "../pwa/InstallAppMenuItem";

function SheetLink({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
          isActive ? "bg-fm-teal-subtle text-fm-teal" : "text-fm-charcoal hover:bg-fm-gray-light/60"
        }`
      }
    >
      <Icon size={20} strokeWidth={2} className="shrink-0 opacity-80" />
      {label}
    </NavLink>
  );
}

export default function MobileMoreSheet({ open, onClose }) {
  const { farms, farm, selectFarm, primaryScenario } = useFarm();
  const onBenchmarkPage = Boolean(useMatch("/scenarios/:id/benchmark"));

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="More menu">
      <button
        type="button"
        className="absolute inset-0 bg-fm-ink/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[min(85dvh,640px)] overflow-y-auto rounded-t-2xl bg-fm-surface shadow-[0_-8px_32px_rgba(28,25,23,0.12)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between border-b border-fm-gray-light px-4 py-4">
          <h2 className="font-display text-lg font-bold text-fm-ink">More</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-fm-gray-light/80 text-fm-gray-medium"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-3">
          {farms.length > 1 && (
            <label className="mb-2 block rounded-xl border border-fm-gray-light bg-fm-cream px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-fm-gray-medium">
                Active farm
              </span>
              <select
                value={farm?.id || ""}
                onChange={(e) => selectFarm(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-fm-input-border bg-white px-3 py-2.5 text-sm font-semibold text-fm-ink"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {TOOLS_NAV.map((item) => (
            <SheetLink key={item.to} {...item} onNavigate={onClose} />
          ))}
          {primaryScenario && (
            <NavLink
              to={`/scenarios/${primaryScenario.id}/benchmark`}
              onClick={onClose}
              className={() =>
                `flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                  onBenchmarkPage
                    ? "bg-fm-teal-subtle text-fm-teal"
                    : "text-fm-charcoal hover:bg-fm-gray-light/60"
                }`
              }
            >
              <BarChart2 size={20} strokeWidth={2} />
              Benchmarks
            </NavLink>
          )}
          <div className="my-2 border-t border-fm-gray-light" />
          <SheetLink to="/profile" label="Profile" icon={UserCircle} end onNavigate={onClose} />
          <SheetLink to="/help" label="Help & support" icon={LifeBuoy} onNavigate={onClose} />
          <a
            href={`mailto:${BRAND.contact.supportEmail}?subject=${encodeURIComponent(`${BRAND.name} support`)}`}
            className="px-4 py-2 text-xs text-fm-gray-medium"
            onClick={onClose}
          >
            {BRAND.contact.supportEmail}
          </a>
          <div className="px-1">
            <InstallAppMenuItem variant="light" />
          </div>
        </nav>
      </div>
    </div>
  );
}
