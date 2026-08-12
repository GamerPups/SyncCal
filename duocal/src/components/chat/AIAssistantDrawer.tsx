"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AIScheduleResponse } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: AIScheduleResponse;
}

interface AIAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
  onEventCreated?: () => void;
}

export function AIAssistantDrawer({
  open,
  onClose,
  workspaceId,
  onEventCreated,
}: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Hi! I\'m your DuoCal assistant. Tell me what to schedule — e.g. "Team meeting tomorrow at 2 PM at the office".',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const pendingMessage = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submitSchedule = async (text: string, forceCreate = false) => {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, workspaceId, forceCreate }),
      });

      const data: AIScheduleResponse = await res.json();

      if (data.created) {
        pendingMessage.current = null;
        onEventCreated?.();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Created "${data.parsed.title}" on ${new Date(data.parsed.start).toLocaleString()}${data.parsed.location ? ` at ${data.parsed.location}` : ""}.${data.googleEventId ? " Synced to Google Calendar." : ""}`,
            data,
          },
        ]);
      } else if (data.conflicts.length > 0) {
        pendingMessage.current = text;
        const conflictList = data.conflicts
          .map((c) => `• ${c.title} (${new Date(c.start).toLocaleTimeString()})`)
          .join("\n");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I found scheduling conflicts:\n${conflictList}\n\nReply "yes" to create anyway.`,
            data,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I couldn't process that request. Try rephrasing." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const isForceYes =
      text.toLowerCase() === "yes" && pendingMessage.current !== null;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    if (isForceYes && pendingMessage.current) {
      await submitSchedule(pendingMessage.current, true);
    } else {
      await submitSchedule(text);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-duocal-border bg-duocal-void shadow-glow-lg"
          >
            <div className="flex items-center justify-between border-b border-duocal-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-duocal-glow/20">
                  <Bot className="h-4 w-4 text-duocal-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">DuoCal AI</h3>
                  <p className="text-xs text-slate-500">Natural language scheduling</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-duocal-glow text-white"
                        : "border border-duocal-border bg-duocal-slate text-slate-300"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.data?.created && (
                      <CheckCircle2 className="mt-1 h-4 w-4 text-green-400" />
                    )}
                    {msg.data && !msg.data.created && msg.data.conflicts.length > 0 && (
                      <AlertTriangle className="mt-1 h-4 w-4 text-amber-400" />
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl border border-duocal-border bg-duocal-slate px-4 py-2 text-sm text-slate-500">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-duocal-border p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Schedule a team meeting tomorrow at 2 PM..."
                  disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
