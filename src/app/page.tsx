
"use client";

import { useEffect, useRef, useState } from "react";
import rulesData from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const rules: Rule[] = rulesData;

const welcomeMessage: Message = {
  id: 1,
  sender: "bot",
  text:
    "👋 Assalam-o-Alaikum! Welcome to Desi Bites!\n\n" +
    "I'm your virtual restaurant assistant. 🍽️\n\n" +
    "Ask me about our menu, deals, opening hours, location, delivery, payment methods, or how to order!",
};

const quickTopics = [
  { label: "Menu", emoji: "🍽️" },
  { label: "Deals", emoji: "🔥" },
  { label: "Timings", emoji: "🕒" },
  { label: "Location", emoji: "📍" },
  { label: "Delivery", emoji: "🛵" },
  { label: "Payment", emoji: "💳" },
];

const fallbackReply =
  "🤔 Sorry, I don't have information about that yet.\n\n" +
  "You can ask me about:\n" +
  "🍽️ Menu and prices\n" +
  "🔥 Deals and offers\n" +
  "🕒 Opening hours\n" +
  "📍 Restaurant location\n" +
  "🛵 Delivery service\n" +
  "💳 Payment methods\n" +
  "🛒 How to order\n" +
  "📞 Contact details\n\n" +
  "Try asking your question another way!";

// Normalize text before matching.
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Find an entire word or phrase rather than a substring.
function containsWholePhrase(
  message: string,
  keyword: string
): boolean {
  const phrase = normalizeText(keyword);

  if (!phrase) return false;

  return (` ${message} `).includes(` ${phrase} `);
}

// Rule-based matching, using the priority order in rules.json.
function getBotReply(input: string): string {
  const message = normalizeText(input);

  if (!message) {
    return "Please type a question so I can help you. 😊";
  }

  // Exact topic shortcuts take priority.
  const exactRule = rules.find(
    (rule) =>
      normalizeText(rule.intent) === message ||
      rule.keywords.some(
        (keyword) => normalizeText(keyword) === message
      )
  );

  if (exactRule) {
    return exactRule.reply;
  }

  // Match whole keywords or phrases.
  for (const rule of rules) {
    const matched = rule.keywords.some((keyword) =>
      containsWholePhrase(message, keyword)
    );

    if (matched) {
      return rule.reply;
    }
  }

  return fallbackReply;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    welcomeMessage,
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const nextIdRef = useRef(2);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function addMessage(
    sender: "user" | "bot",
    text: string
  ) {
    const message: Message = {
      id: nextIdRef.current++,
      sender,
      text,
    };

    setMessages((previous) => [...previous, message]);
  }

  function sendMessage(messageText?: string) {
    const text = (messageText ?? input).trim();

    if (!text || isTyping) return;

    addMessage("user", text);
    setInput("");
    setIsTyping(true);

    const botReply = getBotReply(text);

    timeoutRef.current = setTimeout(() => {
      addMessage("bot", botReply);
      setIsTyping(false);
      timeoutRef.current = null;
      inputRef.current?.focus();
    }, 550);
  }

  function clearChat() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    nextIdRef.current = 2;
    setMessages([welcomeMessage]);
    setInput("");
    setIsTyping(false);
    inputRef.current?.focus();
  }

  return (
    <main className="min-h-screen bg-[#fff8f1] text-slate-800">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 py-4 sm:px-6 sm:py-8">
        {/* Main header */}
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-3xl shadow-lg shadow-orange-200">
              🍽️
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Desi <span className="text-orange-600">Bites</span>
              </h1>

              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Your Friendly Restaurant Assistant
              </p>
            </div>
          </div>

          <span className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 shadow-sm">
            ✨ Rule-Based Chatbot
          </span>
        </header>

        {/* Main chat card */}
        <section className="flex min-h-[650px] flex-1 flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-100/70 sm:min-h-[680px]">
          {/* Orange chatbot header */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-4 text-white sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-2xl">
                👨‍🍳
              </div>

              <div>
                <h2 className="text-base font-bold sm:text-lg">
                  Desi Bites Assistant
                </h2>

                <div className="flex items-center gap-2 text-xs text-orange-50">
                  <span className="h-2 w-2 rounded-full bg-lime-300" />
                  Ready to help
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={clearChat}
              className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-xs font-semibold transition hover:bg-white/25 sm:text-sm"
              title="Start a new conversation"
            >
              ↻ New Chat
            </button>
          </div>

          {/* Demo disclaimer */}
          <div className="border-b border-orange-100 bg-orange-50 px-4 py-2 text-center text-xs text-orange-800">
            Educational demo only — menu, offers, address and contact
            details are fictional.
          </div>

          {/* Chat messages */}
          <div
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-white to-orange-50/40 px-4 py-6 sm:px-7"
          >
            <div className="mb-6 text-center">
              <span className="rounded-full bg-orange-100 px-4 py-1.5 text-xs font-medium text-orange-700">
                Welcome to Desi Bites! 🍊
              </span>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
                    👨‍🍳
                  </div>
                )}

                <div
                  className={`max-w-[85%] whitespace-pre-line break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] sm:text-[15px] ${
                    message.sender === "user"
                      ? "rounded-br-sm bg-orange-500 text-white"
                      : "rounded-bl-sm border border-orange-100 bg-white text-slate-700"
                  }`}
                >
                  {message.text}
                </div>

                {message.sender === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
                    🙂
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
                  👨‍🍳
                </div>

                <div
                  role="status"
                  className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-orange-100 bg-white px-4 py-3 shadow-sm"
                >
                  <span className="text-xs text-slate-500">
                    Typing...
                  </span>

                  <span className="flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400"
                        style={{
                          animationDelay: `${dot * 120}ms`,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Bottom controls */}
          <div className="border-t border-orange-100 bg-white p-4 sm:p-5">
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quick questions
              </p>

              <div className="flex flex-wrap gap-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    disabled={isTyping}
                    onClick={() => sendMessage(topic.label)}
                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    {topic.emoji} {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message form */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50/60 p-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about food, deals, timings..."
                aria-label="Your message"
                maxLength={500}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="shrink-0 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:from-orange-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
              >
                {isTyping ? "..." : "Send ➤"}
              </button>
            </form>

            <p className="mt-3 text-center text-[11px] text-slate-400 sm:text-xs">
              🍴 Powered by rule-based matching • No API • No database
            </p>
          </div>
        </section>

        <footer className="py-4 text-center text-xs text-slate-400">
          © Desi Bites Demo Project • Built with Next.js
        </footer>
      </div>
    </main>
  );
}
