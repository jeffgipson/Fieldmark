import DaleChatPopover from "../dale/DaleChatPopover";
import DaleChatWidget from "../dale/DaleChatWidget";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="fm-canvas min-h-screen">
      <Sidebar />
      <main className="ml-20 min-h-screen px-6 py-8 lg:ml-60 lg:px-10">
        <div className="fm-panel mx-auto max-w-[960px] min-h-[calc(100vh-4rem)] px-6 py-8 md:px-10 md:py-10 animate-fm-in">
          <Outlet />
        </div>
      </main>
      <DaleChatPopover />
      <DaleChatWidget />
    </div>
  );
}
