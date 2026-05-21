import DaleChatPopover from "../dale/DaleChatPopover";
import DaleChatWidget from "../dale/DaleChatWidget";
import { Outlet } from "react-router-dom";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="fm-canvas min-h-screen min-h-[100dvh]">
      <Sidebar />
      <main className="min-h-screen max-lg:px-4 max-lg:pt-[max(0.75rem,env(safe-area-inset-top,0px))] max-lg:pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:ml-60 lg:px-10 lg:py-8">
        <div className="fm-app-content mx-auto max-w-[960px] animate-fm-in lg:min-h-[calc(100vh-4rem)] lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <DaleChatPopover />
      <DaleChatWidget />
    </div>
  );
}
