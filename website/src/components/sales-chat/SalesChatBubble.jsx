import { MessageCircle } from "lucide-react";

export default function SalesChatBubble({ onClick, open }) {
  if (open) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-4 z-50 flex items-center gap-3 rounded-full bg-fm-teal py-2 pl-2 pr-5 text-white shadow-2xl transition hover:bg-fm-teal-hover hover:shadow-fm-teal/30 sm:right-6"
      aria-label="Chat with Dale about Fieldmark"
    >
      <img
        src="/images/dale/dale-avatar.png"
        alt=""
        className="h-12 w-12 rounded-full border-2 border-white/30 object-cover"
      />
      <span className="hidden font-bold sm:inline">Ask Dale</span>
      <MessageCircle size={20} className="sm:hidden" aria-hidden />
    </button>
  );
}
