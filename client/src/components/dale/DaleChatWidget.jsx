import { X } from "lucide-react";
import { useDaleChat } from "../../contexts/DaleChatContext";
import { useFarm } from "../../contexts/FarmContext";
import { DALE_IMAGES } from "../../constants/dale";

export default function DaleChatWidget() {
  const { isOpen, toggleChat } = useDaleChat();
  const { farm, daleHasFindings } = useFarm();

  if (!farm) return null;

  const showFindings = daleHasFindings && !isOpen;
  const ariaLabel = isOpen
    ? "Close chat with Dale"
    : showFindings
      ? "Chat with Dale — new insights available"
      : "Chat with Dale";

  return (
    <button
      type="button"
      onClick={toggleChat}
      className={`group fixed bottom-6 right-6 z-50 hidden h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-fm-teal/50 focus:ring-offset-2 focus:ring-offset-fm-cream lg:flex ${
        isOpen
          ? "bg-fm-gray-dark shadow-lg hover:bg-fm-ink"
          : "overflow-hidden shadow-[0_4px_16px_rgba(13,139,139,0.28)] ring-2 ring-white hover:scale-[1.03] hover:shadow-[0_6px_22px_rgba(13,139,139,0.38)]"
      }`}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X size={26} className="text-white" strokeWidth={2.5} aria-hidden />
      ) : (
        <img
          src={DALE_IMAGES.avatar}
          alt=""
          className="pointer-events-none h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          draggable={false}
        />
      )}
      {showFindings && (
        <span
          className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-fm-gold"
          aria-hidden
        />
      )}
    </button>
  );
}
