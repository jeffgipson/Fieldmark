import { NavLink, useMatch } from "react-router-dom";
import { BarChart2, LifeBuoy, MessageCircle, UserCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { MAIN_NAV, TOOLS_NAV } from "../../constants/nav";
import Logo from "../ui/Logo";
import { BRAND } from "../../constants/brand";
import { useDaleChat } from "../../contexts/DaleChatContext";
import { useFarm } from "../../contexts/FarmContext";
function NavLinkItem({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-white/10 text-white shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={18} strokeWidth={2} className="shrink-0 opacity-80" />
      <span className="sidebar-label flex-1">{label}</span>
    </NavLink>
  );
}

function NavSection({ title, children }) {
  return (
    <div className="mt-6">
      {title && (
        <p className="sidebar-label mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
          {title}
        </p>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const { farms, farm, selectFarm, daleHasFindings, primaryScenario } = useFarm();
  const { toggleChat, isOpen } = useDaleChat();
  const onBenchmarkPage = Boolean(useMatch("/scenarios/:id/benchmark"));
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.email?.split("@")[0] || "Profile";

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-white/5 bg-fm-sidebar lg:flex">
      <div className="px-5 py-6">
        <Logo size="md" onDark />
      </div>
      <nav className="flex flex-1 flex-col px-3 pb-6">
        <NavSection title="Overview">
          {farms.length > 1 && (
            <div className="mb-2 px-3">
              <label htmlFor="farm-switcher" className="sidebar-label mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                Active farm
              </label>
              <select
                id="farm-switcher"
                value={farm?.id || ""}
                onChange={(e) => selectFarm(Number(e.target.value))}
                className="sidebar-label w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id} className="text-fm-charcoal">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {MAIN_NAV.map((item) => (
            <NavLinkItem key={item.to} {...item} />
          ))}
        </NavSection>
        <NavSection title="Decisions">
          <button
            type="button"
            onClick={toggleChat}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isOpen
                ? "bg-fm-teal/20 text-[#7ecece]"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MessageCircle size={18} strokeWidth={2} />
            <span className="sidebar-label flex-1 text-left">Talk to Dale</span>
            {daleHasFindings && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-fm-gold" aria-hidden />
            )}
          </button>
          {TOOLS_NAV.map((item) => (
            <NavLinkItem key={item.to} {...item} />
          ))}
          {primaryScenario && (
            <NavLink
              to={`/scenarios/${primaryScenario.id}/benchmark`}
              className={() =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  onBenchmarkPage ? "bg-fm-teal/20 text-[#7ecece]" : "text-white/60 hover:bg-white/5"
                }`
              }
            >
              <BarChart2 size={18} />
              <span className="sidebar-label">Benchmarks</span>
            </NavLink>
          )}
        </NavSection>
      </nav>
      <div className="border-t border-white/10 px-3 py-4 lg:px-5">
        <NavLink
          to="/profile"
          end
          className={({ isActive }) =>
            `mb-2 flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors lg:justify-start lg:px-3 ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <UserCircle size={18} strokeWidth={2} className="shrink-0" />
          <span className="sidebar-label truncate">{displayName}</span>
        </NavLink>
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors lg:justify-start lg:px-3 ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`
          }
        >
          <LifeBuoy size={18} strokeWidth={2} className="shrink-0" />
          <span className="sidebar-label">Help &amp; support</span>
        </NavLink>
        <a
          href={`mailto:${BRAND.contact.supportEmail}?subject=${encodeURIComponent(`${BRAND.name} support`)}`}
          className="sidebar-label mt-1 hidden px-3 text-[10px] text-white/30 lg:block"
        >
          Or email {BRAND.contact.supportEmail}
        </a>
      </div>
    </aside>
  );
}
