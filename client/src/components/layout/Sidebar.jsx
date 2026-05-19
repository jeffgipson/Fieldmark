import { NavLink } from "react-router-dom";
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Sprout,
  TrendingUp
} from "lucide-react";
import Logo from "../ui/Logo";
import { useDaleChat } from "../../contexts/DaleChatContext";
import { useFarm } from "../../contexts/FarmContext";

const MAIN_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/farm", label: "My Farm", icon: Sprout },
  { to: "/farm", label: "Fields", icon: MapPin },
  { to: "/scenarios", label: "Scenarios", icon: TrendingUp }
];

const TOOLS_NAV = [{ to: "/reports", label: "Reports", icon: FileText }];

function NavLinkItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
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
  const { daleHasFindings, primaryScenario } = useFarm();
  const { toggleChat, isOpen } = useDaleChat();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-white/5 bg-fm-sidebar lg:w-[240px]">
      <div className="px-5 py-6">
        <Logo size="md" onDark />
      </div>
      <nav className="flex flex-1 flex-col px-3 pb-6">
        <NavSection title="Overview">
          {MAIN_NAV.map((item) => (
            <NavLinkItem key={`${item.to}-${item.label}`} {...item} />
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
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? "bg-fm-teal/20 text-[#7ecece]" : "text-white/60 hover:bg-white/5"
                }`
              }
            >
              <BarChart2 size={18} />
              <span className="sidebar-label">Benchmarks</span>
            </NavLink>
          )}
        </NavSection>
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="sidebar-label text-xs leading-relaxed text-white/45">
          MU Extension 2026 benchmarks · Independent planning data
        </p>
      </div>
    </aside>
  );
}
