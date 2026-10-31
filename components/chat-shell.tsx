"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
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

const sidebarItems = ["Search", "Projects", "Artifacts", "Code", "Customize", "Chats and tasks"];

const defaultSession = {
  id: "new-chat",
  title: "New chat",
  model: "gpt-5.6-sol",
  messages: [],
  updatedAt: Date.now(),
};

export function ChatShell() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("new-chat");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string; provider: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt-5.6-sol");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("agentrouter-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

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
    if (sessions.length) localStorage.setItem("agentrouter-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    const getModels = async () => {
      const res = await fetch("/api/models");
      const list = await res.json();
      if (Array.isArray(list)) {
        setModels(list);
        if (!selectedModel && list[0]?.id) setSelectedModel(list[0].id);
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

      if (next.some((session) => session.id === activeId)) return next;
      return [{ id: activeId, title: "New chat", model: selectedModel, messages: nextMessages, updatedAt: Date.now() }, ...prev];
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
        body: JSON.stringify({ model: selectedModel, prompt: trimmed, history: baseMessages }),
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
    if (activeId === sessionId) setActiveId("new-chat");
  };

  const copyMessage = async (content: string) => await navigator.clipboard.writeText(content);

  const isDark = theme === "dark";

  return (
    <div className={isDark ? "min-h-screen bg-[#111827] text-[#edf3ff]" : "min-h-screen bg-[#f6f1e9] text-[#111827]"}>
      <div className="mx-auto max-w-[1700px] min-h-screen">
        <header className={isDark ? "flex items-center justify-between border-b border-white/10 bg-[#1d2430] px-5 py-4" : "flex items-center justify-between border-b border-[#d9d0c7] bg-[#f9f1e9] px-5 py-4"}>
          <div className="flex items-center gap-3">
            <div className={isDark ? "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#222b37] text-xl" : "flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8cfc5] bg-[#f7f2ed] text-xl"}>⌂</div>
            <div className={isDark ? "rounded-full bg-[#2d3644] px-5 py-2 text-[22px] font-semibold tracking-[-0.05em] text-white" : "rounded-full bg-[#eee4d9] px-5 py-2 text-[22px] font-semibold tracking-[-0.05em] text-[#1a1d22]"}>
              agentrouter.org
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} className={isDark ? "rounded-full border border-white/10 bg-[#232d3b] p-2" : "rounded-full border border-[#d7cfc5] bg-[#f8f4ef] p-2"}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" onClick={createNewChat} className={isDark ? "flex items-center gap-2 rounded-full border border-white/10 bg-[#2a313d] px-4 py-2 text-sm" : "flex items-center gap-2 rounded-full border border-[#d7cfc5] bg-[#f8f4ef] px-4 py-2 text-sm"}>
              <MessageSquarePlus size={16} />
              <span>New</span>
            </button>
            <button type="button" className={isDark ? "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#232d3b]" : "flex h-9 w-9 items-center justify-center rounded-full border border-[#d7cfc5] bg-[#f8f4ef]"}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-85px)]">
          <aside className={isDark ? "w-[300px] border-r border-white/10 bg-[#181f2b]" : "w-[300px] border-r border-[#dcd2c7] bg-[#f6f0ea]"}>
            <div className={isDark ? "border-b border-white/10 p-4 text-sm font-medium" : "border-b border-[#d9d0c7] p-4 text-sm font-medium"}>
              <div className="flex items-center gap-2">
                <House size={15} />
                <span>Agent Router</span>
              </div>
            </div>

            <div className="space-y-2 p-3">
              {sidebarItems.map((item) => (
                <button key={item} type="button" className={isDark ? "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#e3ecfb] hover:bg-white/5" : "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#343a44] hover:bg-[#efe6df]"}>
                  <Search size={14} />
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <div className={isDark ? "mt-3 border-t border-white/10 p-3" : "mt-3 border-t border-[#d9d0c7] p-3"}>
              <div className={isDark ? "mb-3 text-[10px] uppercase tracking-[0.18em] text-[#93a1b8]" : "mb-3 text-[10px] uppercase tracking-[0.18em] text-[#6b7280]"}>Chats</div>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} onClick={() => setActiveId(session.id)} className={isDark ? `group flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 ${activeId === session.id ? "bg-white/5" : "hover:bg-white/5"}` : `group flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 ${activeId === session.id ? "bg-[#ece1d8]" : "hover:bg-[#f0e5dc]"}`}>
                    <div className="min-w-0 flex-1 truncate text-sm">{session.messages[0]?.content?.slice(0, 40) || session.title || "New chat"}</div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="ml-2 opacity-0 transition group-hover:opacity-100"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className={isDark ? "relative flex flex-1 flex-col bg-[#101720]" : "relative flex flex-1 flex-col bg-[#faf5f0]"}>
            <div className={isDark ? "flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-[#b6bfd1]" : "flex items-center justify-between border-b border-[#d8d0c8] px-4 py-3 text-sm text-[#4d5566]"}>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-dashed border-current px-2 py-1">AgentRouter</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className={isDark ? "rounded-full border border-white/10 bg-[#1e2937] px-3 py-1.5 text-xs" : "rounded-full border border-[#d7cfc5] bg-[#f8f5f1] px-3 py-1.5 text-xs"}>Free plan</button>
                <button type="button" className={isDark ? "rounded-full bg-[#1d4ed8] px-3 py-1.5 text-xs text-white" : "rounded-full bg-[#1d4ed8] px-3 py-1.5 text-xs text-white"}>Upgrade</button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6">
              <div className="mx-auto max-w-[1100px]">
                <div className={isDark ? "mb-8 text-[44px] font-semibold tracking-[-0.06em] text-[#edf3ff]" : "mb-8 text-[44px] font-semibold tracking-[-0.06em] text-[#1f2430]"}>
                  Good evening, how are things?
                </div>

                <div className={isDark ? "rounded-2xl border border-white/10 bg-[#111b27] p-4" : "rounded-2xl border border-[#d8d0c8] bg-[#f7f0e8] p-4"}>
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                    <Wand2 size={16} />
                    <span>How can I help you today?</span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-3">
                    <button type="button" className={isDark ? "rounded-xl border border-white/10 bg-[#1a2231] px-3 py-2 text-sm" : "rounded-xl border border-[#d7cfc5] bg-[#f8f5f1] px-3 py-2 text-sm"}>Chat</button>
                    <button type="button" className={isDark ? "rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm" : "rounded-xl border border-[#d7cfc5] bg-transparent px-3 py-2 text-sm"}>Create</button>
                    <button type="button" className={isDark ? "rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm" : "rounded-xl border border-[#d7cfc5] bg-transparent px-3 py-2 text-sm"}>Workflow</button>
                    <button type="button" className={isDark ? "rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm" : "rounded-xl border border-[#d7cfc5] bg-transparent px-3 py-2 text-sm"}>Auto</button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {models.length ? (
                      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={isDark ? "rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none" : "rounded-xl border border-[#d7cfc5] bg-white px-3 py-2 text-sm text-[#1f2430] outline-none"}>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>

                {activeSession.messages.length ? (
                  <div className="mt-5 space-y-3">
                    {activeSession.messages.map((item) => (
                      <div key={item.id} className={item.role === "assistant" ? (isDark ? "rounded-2xl border border-white/10 bg-[#121c2d] p-4" : "rounded-2xl border border-[#d8d0c8] bg-[#f7f2ee] p-4") : (isDark ? "rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4" : "rounded-2xl border border-sky-100 bg-sky-50 p-4")}>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[#8390a3]">
                          <span>{item.role === "assistant" ? "Assistant" : "You"}</span>
                          {item.role === "assistant" ? <button type="button" onClick={() => copyMessage(item.content)}><Copy size={14} /></button> : null}
                        </div>
                        <div className="whitespace-pre-wrap text-[15px] leading-7">{item.content}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className={isDark ? "border-t border-white/10 bg-[#121922] p-4" : "border-t border-[#d8d0c8] bg-[#f7f2ee] p-4"}>
              <div className="mx-auto max-w-[1100px]">
                <div className={isDark ? "mb-2 flex items-center gap-2 text-sm text-[#aab7ca]" : "mb-2 flex items-center gap-2 text-sm text-[#697386]"}>
                  <button type="button" className={isDark ? "rounded-lg border border-white/10 p-2" : "rounded-lg border border-[#d7cfc5] p-2"}>+</button>
                  <button type="button" className={isDark ? "rounded-lg border border-white/10 p-2" : "rounded-lg border border-[#d7cfc5] p-2"}><Eraser size={15} /></button>
                </div>

                <div className={isDark ? "flex items-end gap-3 rounded-2xl border border-white/10 bg-[#151e2b] p-3" : "flex items-end gap-3 rounded-2xl border border-[#d7cfc5] bg-white p-3"}>
                  <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} placeholder="Write a message..." className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent text-base outline-none" />
                  <button type="button" onClick={sendMessage} disabled={isLoading} className={isDark ? "flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0b1120] disabled:opacity-60" : "flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1120] text-white disabled:opacity-60"}>
                    {isLoading ? <RefreshCcw className="animate-spin" size={17} /> : <Send size={17} />}
                  </button>
                </div>

                <div className={isDark ? "mt-3 flex items-center justify-between text-xs text-[#9aa9bd]" : "mt-3 flex items-center justify-between text-xs text-[#697386]"}>
                  <div className="flex items-center gap-3">
                    <span>Model: {models.find((m) => m.id === selectedModel)?.name || selectedModel}</span>
                    <button type="button" onClick={() => setInput(input)} className="underline-offset-2 hover:underline">Retry</button>
                  </div>
                  <div className="flex items-center gap-3"><Settings size={14} /></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
