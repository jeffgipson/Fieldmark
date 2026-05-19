import { useState } from "react";

const GREETING = {
  text:
    "Hi — I'm Dale. I help visitors learn how Fieldmark works. Ask about costs, scenarios, pricing, or how to get started.",
  isUser: false
};

export const QUICK_PROMPTS = [
  "What is Fieldmark?",
  "How does pricing work?",
  "Is my data secure?",
  "Start free trial"
];

const RESPONSES = [
  {
    match: (t) => /what is|about fieldmark|tell me about/i.test(t),
    text:
      "Fieldmark is financial planning software for farm and ranch operations. You enter your costs, compare line by line, run downside scenarios, and export reports for lenders and partners.",
    cta: { label: "See how it works", href: "#how-it-works" }
  },
  {
    match: (t) => /benchmark|peer|compare/i.test(t),
    text:
      "You enter per-field input costs and see how they stack up — line by line, per acre. That is the ammunition most operators never had before signing.",
    cta: { label: "Explore solutions", href: "#solutions" }
  },
  {
    match: (t) => /scenario|margin|downside|what if/i.test(t),
    text:
      "You model base case and downside margins at different prices and yields, so you know your break-even before you commit to inputs.",
    cta: { label: "Start free", href: "/register", external: true }
  },
  {
    match: (t) => /pric|cost|trial|free/i.test(t),
    text:
      "You can start with a 30-day free trial — no credit card required. Full cost comparison and scenario tools are included so you can see value on your own operation.",
    cta: { label: "Create account", href: "/register", external: true }
  },
  {
    match: (t) => /secur|data|privacy|encrypt/i.test(t),
    text:
      "Your farm data stays yours. We use industry-standard encryption and never sell your financial information. Dale inside the app only reads data you enter for your account.",
    cta: null
  },
  {
    match: (t) => /dale|analyst|chat|ai/i.test(t),
    text:
      "The Dale you meet after sign-up analyzes your numbers — not generic farm advice. This chat is for learning about Fieldmark; personalized analysis starts in the app.",
    cta: { label: "Start free trial", href: "/register", external: true }
  },
  {
    match: (t) => /start|sign up|register|demo|get started/i.test(t),
    text: "Great — set up takes a few minutes. Add a farm, enter costs, and you will see comparisons and scenarios right away.",
    cta: { label: "Get started free", href: "/register", external: true }
  }
];

const FALLBACK = {
  text:
    "Good question. For anything specific to your operation, the free trial is the fastest path. I can also point you to how Fieldmark works on this page.",
  cta: { label: "Start free trial", href: "/register", external: true }
};

function getReply(input) {
  const trimmed = input.trim();
  for (const r of RESPONSES) {
    if (r.match(trimmed)) return { text: r.text, cta: r.cta, isUser: false };
  }
  return { ...FALLBACK, isUser: false };
}

export function useSalesChat() {
  const [messages, setMessages] = useState([GREETING]);
  const [userInput, setUserInput] = useState("");
  const [waiting, setWaiting] = useState(false);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || waiting) return;

    setMessages((prev) => [...prev, { text: trimmed, isUser: true }]);
    setUserInput("");
    setWaiting(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, getReply(trimmed)]);
      setWaiting(false);
    }, 700);
  };

  return { messages, userInput, setUserInput, sendMessage, waiting };
}
