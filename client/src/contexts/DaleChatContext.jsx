import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFarm } from "./FarmContext";
import * as conversationsApi from "../api/conversations";
import { friendlyError } from "../utils/errors";

const DaleChatContext = createContext(null);

function isClickEvent(value) {
  return value != null && typeof value === "object" && "preventDefault" in value;
}

export function DaleChatProvider({ children }) {
  const { pathname } = useLocation();
  const { farm, primaryScenario } = useFarm();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatScenarioId, setChatScenarioId] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [chatIntent, setChatIntent] = useState(null);
  const pendingSentRef = useRef(false);

  const activeScenarioId = chatScenarioId ?? primaryScenario?.id;

  const resetConversation = useCallback(() => {
    setConversation(null);
    setMessages([]);
    pendingSentRef.current = false;
  }, []);

  const openChat = useCallback(
    (options) => {
      const opts = isClickEvent(options) ? {} : options || {};
      const scenarioId = opts.scenarioId ?? null;

      setChatScenarioId(scenarioId);
      setChatIntent(opts.intent ?? null);

      if (opts.initialMessage) {
        setPendingMessage(opts.initialMessage);
        resetConversation();
      } else {
        setPendingMessage(null);
        const scenarioChanged =
          scenarioId != null &&
          conversation?.scenario_id != null &&
          Number(conversation.scenario_id) !== Number(scenarioId);
        if (scenarioChanged) resetConversation();
      }

      setError(null);
      setIsOpen(true);
    },
    [conversation, resetConversation]
  );

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
          scenarioId: activeScenarioId,
          clientPath: pathname
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
  }, [isOpen, conversation, farm, activeScenarioId]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !conversation) return null;
      setLoading(true);
      setError(null);
      const tempId = `temp-${Date.now()}`;
      const optimistic = { id: tempId, role: "user", content, created_at: new Date().toISOString() };
      setMessages((m) => [...m, optimistic]);

      try {
        const data = await conversationsApi.sendMessage(conversation.id, content, {
          clientPath: pathname
        });
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
    [conversation, pathname]
  );

  useEffect(() => {
    if (!isOpen || !conversation || !pendingMessage || pendingSentRef.current) return;
    if (loading) return;

    pendingSentRef.current = true;
    const message = pendingMessage;
    setPendingMessage(null);
    sendMessage(message);
  }, [isOpen, conversation, pendingMessage, loading, sendMessage]);

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
      sendMessage,
      chatIntent,
      pendingMessage
    }),
    [
      isOpen,
      openChat,
      conversation,
      messages,
      loading,
      error,
      sendMessage,
      chatIntent,
      pendingMessage
    ]
  );

  return <DaleChatContext.Provider value={value}>{children}</DaleChatContext.Provider>;
}

export function useDaleChat() {
  const ctx = useContext(DaleChatContext);
  if (!ctx) throw new Error("useDaleChat must be used within DaleChatProvider");
  return ctx;
}
