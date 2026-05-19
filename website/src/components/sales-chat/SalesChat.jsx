import { useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { useSalesChat, QUICK_PROMPTS } from "../../lib/useSalesChat";
import { appPath } from "../../lib/links";

function MessageCta({ cta }) {
  if (!cta) return null;
  const href = cta.external ? appPath(cta.href) : cta.href;

  if (cta.external) {
    return (
      <a
        href={href}
        className="mt-3 inline-block rounded-lg bg-fm-teal px-4 py-2 text-xs font-bold text-white hover:bg-fm-teal-hover"
      >
        {cta.label}
      </a>
    );
  }

  return (
    <a href={href} className="mt-3 inline-block text-xs font-bold text-fm-teal hover:underline">
      {cta.label} →
    </a>
  );
}

export default function SalesChat({ open, onClose }) {
  const { messages, userInput, setUserInput, sendMessage, waiting } = useSalesChat();
  const messagesEndRef = useRef(null);
  const showQuickPrompts = messages.length === 1 && !waiting;

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, waiting]);

  const handleSend = () => {
    if (userInput.trim()) sendMessage(userInput);
  };

  if (!open) return null;

  return (
    <div
      className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,85vh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-fm-gray-light bg-white shadow-2xl sm:right-6"
      role="dialog"
      aria-label="Chat with Dale"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-fm-gray-light bg-fm-gray-dark px-4 py-3">
        <img
          src="/images/dale/dale-avatar.png"
          alt=""
          className="h-10 w-10 rounded-full bg-fm-teal/20 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-white">Dale</p>
          <p className="truncate text-xs text-white/60">Fieldmark guide</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col bg-fm-cream">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.isUser
                    ? "rounded-br-md bg-fm-teal text-white"
                    : "rounded-bl-md border border-fm-gray-light bg-white text-fm-charcoal"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {!msg.isUser && <MessageCta cta={msg.cta} />}
              </div>
            </div>
          ))}
          {waiting && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-fm-gray-light bg-white px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-fm-teal/50" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-fm-teal/50 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-fm-teal/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showQuickPrompts && (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-fm-gray-light bg-white px-4 py-3">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-fm-teal/30 bg-white px-3 py-1.5 text-xs font-bold text-fm-teal transition hover:bg-fm-teal hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="shrink-0 border-t border-fm-gray-light bg-white p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about Fieldmark..."
              className="min-w-0 flex-1 rounded-xl border border-fm-input-border bg-fm-cream px-4 py-2.5 text-sm focus:border-fm-teal focus:outline-none focus:ring-2 focus:ring-fm-teal/20"
              disabled={waiting}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={waiting || !userInput.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fm-teal text-white transition hover:bg-fm-teal-hover disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-fm-gray-medium">
            Planning info only · Personalized analysis after sign-up
          </p>
        </div>
      </div>
    </div>
  );
}
