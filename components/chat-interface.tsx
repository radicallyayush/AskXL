"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

const GEMINI_KEY_STORAGE = "askxl-gemini-api-key";

type ChatMode = "browser" | "env" | "demo" | "error" | "idle";

type ChatPayload = {
  answer?: string;
  error?: string;
  mode?: Exclude<ChatMode, "idle">;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function modeLabel(mode: ChatMode) {
  switch (mode) {
    case "browser":
      return "Using browser key";
    case "env":
      return "Using server key";
    case "demo":
      return "Demo mode";
    case "error":
      return "Gemini error";
    default:
      return "Ready";
  }
}

function modeTone(mode: ChatMode) {
  switch (mode) {
    case "browser":
    case "env":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "demo":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-sky-100 bg-sky-50 text-slate-600";
  }
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ChatInterface({ initialQuestion = "Summarize Rahul." }: { initialQuestion?: string }) {
  const [question, setQuestion] = useState(initialQuestion);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedKey = window.localStorage.getItem(GEMINI_KEY_STORAGE) ?? "";
    setGeminiKey(storedKey);
    setSavedKey(storedKey);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, error, loading]);

  function saveGeminiKey() {
    const trimmedKey = geminiKey.trim();
    if (!trimmedKey) {
      window.localStorage.removeItem(GEMINI_KEY_STORAGE);
      setSavedKey("");
      return;
    }

    window.localStorage.setItem(GEMINI_KEY_STORAGE, trimmedKey);
    setSavedKey(trimmedKey);
  }

  function clearGeminiKey() {
    window.localStorage.removeItem(GEMINI_KEY_STORAGE);
    setGeminiKey("");
    setSavedKey("");
  }

  async function submitQuestion() {
    const nextQuestion = question.trim();
    if (!nextQuestion || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: nextQuestion }]);

    try {
      const effectiveKey = geminiKey.trim() || savedKey.trim();
      if (geminiKey.trim() && geminiKey.trim() !== savedKey.trim()) {
        window.localStorage.setItem(GEMINI_KEY_STORAGE, geminiKey.trim());
        setSavedKey(geminiKey.trim());
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nextQuestion,
          geminiApiKey: effectiveKey || undefined
        })
      });

      const payload = (await response.json()) as ChatPayload;
      const nextAnswer = payload.answer ?? payload.error ?? "No response returned.";
      setMode(payload.mode ?? "idle");
      setError(payload.error ?? "");
      setMessages((current) => [...current, { role: "assistant", content: nextAnswer }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitQuestion();
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-sky-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]">
        <CardHeader className="border-b border-sky-50 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">AskXL Chat</p>
                <CardTitle className="text-3xl leading-tight text-slate-900 sm:text-4xl">Ask the student intelligence index in plain language.</CardTitle>
                <CardDescription className="text-base leading-7 text-slate-600">
                  Ask about students, attendance, projects, skills, or placements. The assistant stays file-based and only uses the generated JSON index.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className={cn("rounded-full border px-4 py-2 text-sm font-medium shadow-sm", modeTone(mode))}>{modeLabel(mode)}</div>
                <div className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
                  Natural language only
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-sky-100 bg-white/80 p-4 shadow-[0_8px_24px_rgba(59,130,246,0.05)] lg:max-w-3xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Gemini key</p>
                  <p className="mt-1 text-sm text-slate-600">Paste your key here to use Gemini directly in the browser.</p>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-slate-500">
                  {geminiKey.trim() || savedKey.trim() ? "Saved in browser" : "Empty"}
                </span>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  value={geminiKey}
                  onChange={(event) => setGeminiKey(event.target.value)}
                  placeholder="Paste your Gemini API key"
                  type="password"
                  className="h-11 border-sky-100 bg-sky-50/40 text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-200"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={saveGeminiKey} className="rounded-full border-sky-100 bg-sky-100 text-slate-700 hover:bg-sky-200">
                    Save
                  </Button>
                  <Button type="button" variant="ghost" onClick={clearGeminiKey} className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-[42rem] flex-col p-0">
          <div className="flex-1 border-b border-sky-50 bg-gradient-to-br from-white to-sky-50/60 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Conversation</p>
            <div className="mt-4 space-y-4">
              {messages.length ? (
                messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[90%] rounded-3xl border px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[85%]",
                        message.role === "user"
                          ? "border-sky-100 bg-gradient-to-br from-sky-100 to-cyan-50 text-slate-800"
                          : "border-violet-100 bg-white text-slate-700"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{cleanText(message.content)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-sky-100 bg-white p-6">
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">Ready when you are.</p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    AskXL will answer using the local student index. Try a student name, a skill, or a comparison question.
                  </p>
                </div>
              )}

              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-3xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    Thinking with Gemini...
                  </div>
                </div>
              ) : null}

              {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            </div>
          </div>

          <div className="rounded-b-[1.5rem] border-t border-sky-50 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(59,130,246,0.04)] backdrop-blur-xl sm:p-5">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 rounded-[1.75rem] border border-sky-100 bg-gradient-to-br from-white to-sky-50/50 p-3 shadow-[0_8px_24px_rgba(59,130,246,0.05)]">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="AskXL can summarize, compare, or search student profiles..."
                  rows={2}
                  className="min-h-[72px] w-full resize-none rounded-2xl border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submitQuestion();
                    }
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)] hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <div ref={bottomRef} />
    </section>
  );
}
