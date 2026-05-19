import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFarm } from "./FarmContext";
import * as conversationsApi from "../api/conversations";
import { friendlyError } from "../utils/errors";

const DaleChatContext = createContext(null);

export function DaleChatProvider({ children }) {
  const { farm, primaryScenario } = useFarm();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen || conversation) return;
    if (!farm) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await conversationsApi.createConversation({
          farmId: farm.id,
          scenarioId: primaryScenario?.id
        });
        if (!cancelled) {
          setConversation(data);
          setMessages(data.messages || []);
        }
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, conversation, farm, primaryScenario]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !conversation) return null;
      setLoading(true);
      setError(null);
      const tempId = `temp-${Date.now()}`;
      const optimistic = { id: tempId, role: "user", content, created_at: new Date().toISOString() };
      setMessages((m) => [...m, optimistic]);

      try {
        const data = await conversationsApi.sendMessage(conversation.id, content);
        setMessages((m) => [
          ...m.filter((x) => x.id !== tempId),
          data.user_message,
          data.assistant_message
        ]);
      } catch (err) {
        setMessages((m) => m.filter((x) => x.id !== tempId));
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
      return null;
    },
    [conversation]
  );

  const value = useMemo(
    () => ({
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      conversation,
      messages,
      loading,
      error,
      sendMessage
    }),
    [isOpen, openChat, closeChat, toggleChat, conversation, messages, loading, error, sendMessage]
  );

  return <DaleChatContext.Provider value={value}>{children}</DaleChatContext.Provider>;
}

export function useDaleChat() {
  const ctx = useContext(DaleChatContext);
  if (!ctx) throw new Error("useDaleChat must be used within DaleChatProvider");
  return ctx;
}
