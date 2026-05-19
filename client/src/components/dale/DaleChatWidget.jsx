import { X } from "lucide-react";
import { useDaleChat } from "../../contexts/DaleChatContext";
import { useFarm } from "../../contexts/FarmContext";
import DaleAvatar from "./DaleAvatar";

export default function DaleChatWidget() {
  const { isOpen, toggleChat } = useDaleChat();
  const { farm } = useFarm();

  if (!farm) return null;

  return (
    <button
      type="button"
      onClick={toggleChat}
      className={`fm-chat-bubble fixed bottom-6 right-6 z-50 flex items-center justify-center shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-fm-teal/50 focus:ring-offset-2 focus:ring-offset-transparent ${
        isOpen
          ? "h-14 w-14 rounded-full bg-fm-gray-dark hover:bg-fm-ink"
          : "h-[68px] w-[68px] rounded-[2rem] bg-fm-teal hover:scale-105 hover:bg-fm-teal-hover"
      }`}
      aria-label={isOpen ? "Close chat with Dale" : "Chat with Dale"}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X size={28} className="text-white" strokeWidth={2.5} />
      ) : (
        <DaleAvatar variant="avatar" size="md" className="pointer-events-none" />
      )}
    </button>
  );
}
