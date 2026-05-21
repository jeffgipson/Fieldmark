import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, MessageCircle } from "lucide-react";
import { MOBILE_TAB_NAV } from "../../constants/nav";
import { useDaleChat } from "../../contexts/DaleChatContext";
import { useFarm } from "../../contexts/FarmContext";
import { DALE_IMAGES } from "../../constants/dale";
import MobileMoreSheet from "./MobileMoreSheet";

function TabLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
          isActive ? "text-fm-teal" : "text-fm-gray-medium"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.25 : 2} aria-hidden />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { toggleChat, isOpen } = useDaleChat();
  const { farm, daleHasFindings } = useFarm();
  const location = useLocation();

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const moreActive =
    moreOpen ||
    ["/reports", "/resources", "/integrations", "/profile", "/help"].some((p) =>
      location.pathname.startsWith(p)
    ) ||
    location.pathname.includes("/benchmark");

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-fm-gray-light bg-fm-surface/95 backdrop-blur-md lg:hidden pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around px-1 pt-1">
          {MOBILE_TAB_NAV.map((item) => (
            <TabLink key={item.to} {...item} />
          ))}
          {farm && (
            <button
              type="button"
              onClick={toggleChat}
              className={`relative flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                isOpen ? "text-fm-teal" : "text-fm-gray-medium"
              }`}
              aria-label={isOpen ? "Close chat with Dale" : "Talk to Dale"}
              aria-expanded={isOpen}
            >
              <span className="relative flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full ring-1 ring-fm-teal/20">
                <img src={DALE_IMAGES.avatar} alt="" className="h-full w-full object-cover" draggable={false} />
              </span>
              <span>Dale</span>
              {daleHasFindings && !isOpen && (
                <span className="absolute right-[calc(50%-1.25rem)] top-2 h-2 w-2 rounded-full bg-fm-gold ring-2 ring-white" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              moreActive ? "text-fm-teal" : "text-fm-gray-medium"
            }`}
            aria-label="More menu"
            aria-expanded={moreOpen}
          >
            <Menu size={22} strokeWidth={2} aria-hidden />
            <span>More</span>
          </button>
        </div>
      </nav>
      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
