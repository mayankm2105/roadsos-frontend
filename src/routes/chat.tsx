import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Send, Trash2, Square } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { ChatBubble } from "@/components/ChatBubble";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services/api";
import type { ChatMessage } from "@/types";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — RoadSoS" },
      {
        name: "description",
        content:
          "Chat with the RoadSoS assistant for instant emergency guidance and nearby service lookups.",
      },
    ],
  }),
  component: Chat,
});

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  text: "Hi, I'm your RoadSoS assistant. Tell me what happened and I'll help you find the nearest ambulance, hospital, or police.",
  timestamp: Date.now(),
  suggestions: ["Find nearest ambulance", "I had an accident", "Nearest hospital"],
};

function Chat() {
  const location = useAppStore((s) => s.location);
  const lang = useAppStore((s) => s.lang);
  const sessionId = useAppStore((s) => s.sessionId);

  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const pushTyping = () => {
    setMessages((m) => [
      ...m,
      { id: "typing", role: "assistant", text: "", timestamp: Date.now(), typing: true },
    ]);
  };
  const replaceTyping = (msg: ChatMessage) => {
    setMessages((m) => [...m.filter((x) => x.id !== "typing"), msg]);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    pushTyping();

    const res = await api.chatMessage({
      session_id: sessionId,
      message: trimmed,
      location: location ?? { lat: 0, lng: 0, address: "" },
      lang,
    });

    const reply =
      res.data?.reply?.text ??
      (res.error
        ? "I couldn't reach the assistant. For urgent help call 108 now."
        : "I'm here to help.");

    replaceTyping({
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply,
      timestamp: Date.now(),
      suggestions: res.data?.suggestions,
      services: res.data?.services,
    });
    setSending(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "recording.wav");
        form.append("session_id", sessionId);
        form.append("lang", lang);
        if (location) {
          form.append("location", JSON.stringify({ lat: location.lat, lng: location.lng }));
        }
        setSending(true);
        pushTyping();
        const res = await api.chatVoice(form);
        if (res.data?.transcript) {
          setMessages((m) => [
            ...m.filter((x) => x.id !== "typing"),
            {
              id: crypto.randomUUID(),
              role: "user",
              text: res.data!.transcript!,
              timestamp: Date.now(),
            },
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: res.data?.reply ?? "Got it.",
              timestamp: Date.now(),
            },
          ]);
        } else {
          replaceTyping({
            id: crypto.randomUUID(),
            role: "assistant",
            text: res.error
              ? "Voice transcription failed. Please type your message."
              : (res.data?.reply ?? "Got it."),
            timestamp: Date.now(),
          });
        }
        setSending(false);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Microphone permission denied. Please type instead.",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col">
      <TopBar
        title="AI Assistant"
        right={
          <button
            onClick={() => setMessages([GREETING])}
            aria-label="Clear chat"
            className="press flex h-9 w-9 items-center justify-center rounded-full bg-elevated"
          >
            <Trash2 size={18} color="var(--text-secondary)" />
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} onSuggestion={send} />
        ))}
      </div>

      <div className="border-t border-line bg-background px-4 py-3">
        {recording ? (
          <div className="flex items-center justify-between gap-3 rounded-pill border border-line bg-elevated px-4 py-2">
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background: "var(--accent-red)",
                  animation: "gps-pulse 1s infinite",
                }}
              />
              <span className="text-sm text-foreground">Recording {mmss}</span>
            </span>
            <button
              onClick={stopRecording}
              className="press flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "var(--accent-blue)" }}
            >
              <Square size={16} color="#fff" fill="#fff" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Type your message…"
              className="flex-1 rounded-pill bg-elevated px-4 py-3 text-[15px] text-foreground outline-none placeholder:text-secondary"
              style={{ border: "1px solid var(--border-subtle)" }}
            />
            {input.trim() ? (
              <button
                onClick={() => send(input)}
                disabled={sending}
                aria-label="Send"
                className="press flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-50"
                style={{ background: "var(--accent-blue)" }}
              >
                <Send size={20} color="#fff" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                aria-label="Record voice"
                className="press flex h-12 w-12 items-center justify-center rounded-full bg-elevated"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                <Mic size={20} color="var(--pure-white)" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
