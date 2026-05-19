import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useDaleChat } from "../../contexts/DaleChatContext";
import { useFarm } from "../../contexts/FarmContext";
import * as prioritiesApi from "../../api/priorities";
import DaleAvatar from "./DaleAvatar";
import DaleChatBubble from "./DaleChatBubble";
import DaleDisclaimer from "./DaleDisclaimer";
import LoadingDale from "../ui/LoadingDale";
import { DALE_SUGGESTIONS } from "../../constants/app";
import { DALE_COPY } from "../../constants/dale";

export default function DaleChatPopover() {
  const { isOpen, closeChat, messages, loading, error, sendMessage, chatIntent, pendingMessage } =
    useDaleChat();
  const suggestions =
    chatIntent === "decision_help"
      ? DALE_COPY.decisionHelp.suggestions
      : DALE_SUGGESTIONS;
  const { farm, setPriorities } = useFarm();
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [savingPriorityId, setSavingPriorityId] = useState(null);
  const [prioritySavedId, setPrioritySavedId] = useState(null);
  const endRef = useRef(null);

  async function saveAsPriority(message) {
    if (!farm?.id || !message?.content?.trim()) return;
    setSavingPriorityId(message.id);
    try {
      const created = await prioritiesApi.createPriorityFromMessage(farm.id, message.content);
      setPriorities((prev) => [created, ...(prev || [])]);
      setPrioritySavedId(message.id);
    } catch {
      // ignore — user can add from dashboard
    } finally {
      setSavingPriorityId(null);
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(content) {
    if (!content.trim()) return;
    setShowSuggestions(false);
    setInput("");
    await sendMessage(content);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 h-[640px] w-[min(520px,calc(100vw-1.5rem))] animate-fm-in rounded-xl border border-fm-gray-light bg-fm-surface shadow-[var(--shadow-fm-panel)]">
      <div className="flex h-full flex-col">
        <header className="relative flex items-center gap-3 border-b border-fm-gray-light px-4 py-3">
          <DaleAvatar variant="avatar" size="sm" />
          <div>
            <h2 className="font-display font-semibold text-fm-ink">{DALE_COPY.name}</h2>
            <p className="text-xs text-fm-gray-medium">{DALE_COPY.tagline}</p>
          </div>
          <button
            type="button"
            onClick={closeChat}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-fm-gray-light/60 text-fm-gray-medium transition-colors hover:bg-fm-gray-light hover:text-fm-ink"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && messages.length === 0 && <LoadingDale variant="chat" />}
          {messages.map((msg) => (
            <div key={msg.id}>
              <DaleChatBubble
                content={msg.content}
                timestamp={msg.created_at}
                isFarmer={msg.role === "user"}
              />
              {msg.role === "user" && farm?.id && (
                <div className={`mb-3 flex ${msg.role === "user" ? "justify-end" : ""}`}>
                  <button
                    type="button"
                    onClick={() => saveAsPriority(msg)}
                    disabled={savingPriorityId === msg.id || prioritySavedId === msg.id}
                    className="text-xs font-medium text-fm-teal hover:underline disabled:opacity-50"
                  >
                    {prioritySavedId === msg.id
                      ? "Saved to priorities"
                      : savingPriorityId === msg.id
                        ? "Saving..."
                        : "Save as season priority"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && messages.length > 0 && <LoadingDale variant="chat" />}
          {!loading && error && (
            <p className="rounded-lg border border-fm-alert/30 bg-[#fff8f8] px-3 py-2 text-sm text-fm-alert">
              {error}
            </p>
          )}
          <div ref={endRef} />
        </div>

        {showSuggestions && !loading && !pendingMessage && messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 border-t border-fm-gray-light px-4 py-3">
            {suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-full border border-fm-teal/30 px-3 py-1.5 text-xs text-fm-teal hover:bg-fm-teal-subtle"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form
          className="flex items-center gap-2 border-t border-fm-gray-light bg-white p-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <input
            className="flex-1 rounded-full border-[1.5px] border-fm-input-border bg-fm-cream px-5 py-3 text-base duration-200 focus:border-fm-teal focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-fm-teal/20"
            placeholder="Ask Dale anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-fm-teal text-white transition-colors duration-200 hover:bg-fm-teal-hover focus:outline-none disabled:opacity-50"
            aria-label="Send"
          >
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="border-t border-fm-gray-light bg-white px-4 py-1.5">
          <DaleDisclaimer />
        </div>
      </div>
    </div>
  );
}
