import DaleChatPopover from "../dale/DaleChatPopover";
import DaleChatWidget from "../dale/DaleChatWidget";
import { Outlet } from "react-router-dom";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="fm-canvas min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="min-h-screen px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-4 lg:ml-60 lg:px-10 lg:py-8 lg:pb-8">
        <div className="app-shell-panel mx-auto max-w-[960px] animate-fm-in">
          <Outlet />
        </div>
      </main>
      <DaleChatPopover />
      <DaleChatWidget />
    </div>
  );
}
