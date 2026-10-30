"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Copy,
  Eraser,
  House,
  MessageSquarePlus,
  Moon,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Send,
  Settings,
  Sun,
  Trash2,
  Wand2,
} from "lucide-react";
import type { ChatSession, Message } from "@/lib/types";

const sidebarItems = [
  "Search",
  "Projects",
  "Artifacts",
  "Code",
  "Customize",
  "Chats and tasks",
];

const defaultSession = {
  id: "new-chat",
  title: "New chat",
  model: "claude-3-5-sonnet",
  messages: [],
  updatedAt: Date.now(),
};

export function ChatShell() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("new-chat");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string; provider: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState("claude-3-5-sonnet");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("agentrouter-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    const savedSessions = localStorage.getItem("agentrouter-sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions) as ChatSession[];
        if (parsed.length) {
          setSessions(parsed);
          setActiveId(parsed[0].id);
          setSelectedModel(parsed[0].model || selectedModel);
          return;
        }
      } catch {}
    }

    setSessions([defaultSession]);
    setActiveId(defaultSession.id);
  }, []);

  useEffect(() => {
    localStorage.setItem("agentrouter-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (sessions.length) {
      localStorage.setItem("agentrouter-sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    const getModels = async () => {
      const res = await fetch("/api/models");
      const list = await res.json();
      if (Array.isArray(list)) {
        setModels(list);
        if (!selectedModel && list[0]?.id) {
          setSelectedModel(list[0].id);
        }
      }
    };

    getModels();
  }, [selectedModel]);

  const activeSession = useMemo(() => {
    return sessions.find((session) => session.id === activeId) || sessions[0] || defaultSession;
  }, [activeId, sessions]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: "New chat",
      model: selectedModel,
      messages: [],
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    setInput("");
  };

  const updateActiveSession = (nextMessages: Message[]) => {
    setSessions((prev) => {
      const next = prev.map((session) => {
        if (session.id !== activeId) return session;
        return {
          ...session,
          messages: nextMessages,
          title: nextMessages[0]?.content ? nextMessages[0].content.slice(0, 28) : "New chat",
          updatedAt: Date.now(),
        };
      });

      if (next.some((session) => session.id === activeId)) {
        return next;
      }

      return [
        {
          id: activeId,
          title: "New chat",
          model: selectedModel,
          messages: nextMessages,
          updatedAt: Date.now(),
        },
        ...prev,
      ];
    });
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const baseMessages = activeSession.messages.length ? activeSession.messages : [];
    const nextMessages = [...baseMessages, userMessage];
    updateActiveSession(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: trimmed,
          history: baseMessages,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.text || "No response received.",
        timestamp: Date.now(),
      };

      updateActiveSession([...nextMessages, assistantMessage]);
    } catch {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "The model request failed. Please retry.",
        timestamp: Date.now(),
      };
      updateActiveSession([...nextMessages, assistantMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (activeId === sessionId) {
      setActiveId("new-chat");
    }
  };

  const retryLast = async () => {
    if (!activeSession.messages.length) return;
    const lastUser = [...activeSession.messages].reverse().find((msg) => msg.role === "user");
    if (!lastUser) return;

    setInput(lastUser.content);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const themeClasses =
    theme === "dark"
      ? "bg-[#0d1117] text-[#e5e7eb]"
      : "bg-[#f5f0ea] text-[#1a1a1a]";

  const surfaceClass =
    theme === "dark" ? "bg-[#111827] border-[#2a3347]" : "bg-[#f8f5f1] border-[#ddd0c8]";

  const inputClass =
    theme === "dark"
      ? "bg-[#1a1f2b] border-[#2b3447] text-white"
      : "bg-white border-[#e2d7ce] text-[#1f2937]";

  return (
    <div className={`min-h-screen ${themeClasses}`}>
      <div className="mx-auto max-w-[1800px] min-h-screen">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-xl">⌂</div>
            <div className="flex items-center gap-3 rounded-full bg-[#2a2f39] px-5 py-3 shadow-inner shadow-black/20">
              <span className="text-2xl font-semibold tracking-tight">agentrouter.org</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border border-white/10 p-2 text-sm"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={createNewChat}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <MessageSquarePlus size={18} />
              <span className="text-sm">New</span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-73px)]">
          <aside className={`w-[280px] border-r ${surfaceClass}`}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <House size={15} />
                <span>AgentRouter</span>
              </div>
              <button className="rounded-md border border-white/10 p-1.5 text-xs">≡</button>
            </div>

            <div className="space-y-2 p-3">
              {sidebarItems.map((item) => (
                <button
                  key={item}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                    item === "Chats and tasks" ? "bg-white/5" : "hover:bg-white/5"
                  }`}
                  type="button"
                >
                  <Search size={14} />
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 border-t border-white/10 p-3">
              <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gray-400">Chats</div>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setActiveId(session.id)}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 transition ${
                      activeId === session.id ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0 flex-1 truncate text-sm">
                      {session.messages[0]?.content?.slice(0, 36) || session.title || "New chat"}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="ml-2 opacity-0 transition group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="relative flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="rounded-full border border-dashed border-white/10 px-2 py-1">AgentRouter</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">Free plan</button>
                <button className="rounded-full bg-[#1e293b] px-3 py-1.5 text-sm text-white">Upgrade</button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <h1 className="mb-8 text-5xl font-semibold tracking-[-0.05em] text-[#111827] dark:text-white">
                Evening, how are things?
              </h1>

              <div className="mx-auto max-w-4xl space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                    <Wand2 size={16} />
                    <span>How can I help you today?</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white">Chat</button>
                    <button className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm">Create</button>
                    <button className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm">Workflow</button>
                    <button className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm">Auto</button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {models.length ? (
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none"
                      >
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>

                {activeSession.messages.length ? (
                  <div className="space-y-3">
                    {activeSession.messages.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 ${
                          item.role === "assistant"
                            ? "border-white/10 bg-white/5"
                            : "border-sky-500/20 bg-sky-500/5"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                          <span>{item.role === "assistant" ? "Assistant" : "You"}</span>
                          <div className="flex items-center gap-2">
                            {item.role === "assistant" ? (
                              <button onClick={() => copyMessage(item.content)}>
                                <Copy size={14} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-[15px] leading-7 text-current">{item.content}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                  <button type="button" className="rounded-lg border border-white/10 p-2">
                    +
                  </button>
                  <button type="button" className="rounded-lg border border-white/10 p-2">
                    <Eraser size={15} />
                  </button>
                </div>

                <div className={`flex items-end gap-3 rounded-2xl border ${inputClass} p-3`}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Write a message..."
                    className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent text-base outline-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? <RefreshCcw className="animate-spin" size={17} /> : <Send size={17} />}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span>Model: {models.find((m) => m.id === selectedModel)?.name || selectedModel}</span>
                    <button type="button" onClick={retryLast}>
                      Retry
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
