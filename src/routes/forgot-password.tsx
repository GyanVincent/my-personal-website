import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_URL, SITE } from "@/lib/site";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({ meta: [{ title: `Reset password ${SITE.short}` }, { name: "robots", content: "noindex" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Check your email for the reset link.");
  }

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-[#161616] p-8">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="" className="h-12 w-12 rounded-md ring-1 ring-[#8B5CF6]/40 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold">Forgot password</h1>
          <p className="text-sm text-muted-foreground mt-1">We'll email you a reset link.</p>
        </div>
        {sent ? (
          <p className="text-sm text-center text-muted-foreground py-6">If that email exists, a reset link is on its way.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50" />
            </div>
            <button type="submit" disabled={busy} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] disabled:opacity-50">
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <Link to="/auth" className="mt-6 text-sm text-muted-foreground hover:text-white inline-flex items-center gap-1.5"><ArrowLeft size={14} /> Back to sign in</Link>
      </div>
    </div>
  );
}
