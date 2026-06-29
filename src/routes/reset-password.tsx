import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_URL, SITE } from "@/lib/site";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: `Set new password ${SITE.short}` }, { name: "robots", content: "noindex" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated. Redirecting…");
    setTimeout(() => navigate({ to: "/admin" }), 800);
  }

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-[#161616] p-8">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="" className="h-12 w-12 rounded-md ring-1 ring-[#8B5CF6]/40 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold">Set new password</h1>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50" />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] disabled:opacity-50">
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
