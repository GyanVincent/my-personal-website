import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LOGO_URL, SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/admin" });
  },
  head: () => ({ meta: [{ title: `Sign in ${SITE.short}` }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/admin" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally { setBusy(false); }
  }

  async function google() {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass rounded-3xl p-8">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="" className="h-12 w-12 rounded-md ring-1 ring-brand/40 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin access for VinTechAI</p>
        </div>
        <button onClick={google} disabled={busy} className="w-full mb-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium glass hover:text-brand transition disabled:opacity-50">
          Continue with Google
        </button>
        <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2.5 rounded-xl bg-input/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2.5 rounded-xl bg-input/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
          <button type="submit" disabled={busy} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        {mode === "signin" && (
          <p className="mt-3 text-center">
            <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-brand">Forgot password?</a>
          </p>
        )}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "No account?" : "Already have one?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-brand hover:underline">
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
