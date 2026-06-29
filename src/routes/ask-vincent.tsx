import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LOGO_URL, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/ask-vincent")({
  head: () => ({
    meta: [
      { title: `Ask Vincent AI ${SITE.short}` },
      { name: "description", content: "Ask Vincent AI about Vincent's skills, education, projects, certifications, and services — instant answers powered by AI." },
      { property: "og:title", content: `Ask Vincent AI ${SITE.short}` },
      { property: "og:description", content: "An AI assistant that knows Vincent's work, skills, and services." },
      { property: "og:url", content: "/ask-vincent" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/ask-vincent" }],
  }),
  component: AskVincent,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What services does Vincent offer?",
  "Show me Vincent's top skills.",
  "Tell me about Vincent's recent projects.",
  "How do I hire Vincent for an AI project?",
];

function AskVincent() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm **Vincent AI** 👋 — ask me about Vincent's skills, projects, services, or how to get in touch." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { textareaRef.current?.focus(); }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Sorry, no response." }]);
    } catch (e: any) {
      toast.error("Couldn't get a response", { description: e.message });
      setMessages([...next, { role: "assistant", content: "Sorry — I couldn't respond just now. Please try again in a moment, or reach Vincent directly via the Contact page." }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="AI Assistant" title="Ask Vincent AI" description="Get instant answers about Vincent's work, skills, services, and how to collaborate." />

      <Reveal>
        <div className="glass rounded-3xl flex flex-col h-[68dvh] min-h-[520px] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
            <div className="relative">
              <img src={LOGO_URL} alt="" className="h-9 w-9 rounded-md ring-1 ring-brand/40" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground leading-tight flex items-center gap-1.5">Vincent AI <Sparkles size={14} className="text-brand" /></p>
              <p className="text-xs text-muted-foreground">Powered by Groq • Online</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 bg-gradient-to-r from-brand to-brand-violet text-primary-foreground text-sm">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] flex gap-3">
                    <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md ring-1 ring-brand/40 shrink-0" />
                    <div className="prose prose-invert prose-sm prose-p:my-2 prose-a:text-brand prose-strong:text-foreground max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md ring-1 ring-brand/40 shrink-0" />
                <div className="flex gap-1 pt-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 sm:px-6 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full glass hover:text-brand transition">{s}</button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border/60 p-3 flex gap-2 items-end"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              rows={1}
              placeholder="Ask about skills, projects, services…"
              className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-input/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 max-h-32"
            />
            <button
              type="submit" disabled={loading || !input.trim()}
              className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-xl text-primary-foreground bg-gradient-to-r from-brand to-brand-violet disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
