import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ALL_ROLES, ROLE_LABEL, type AdminRole } from "@/lib/admin/rbac";

type Row = { id: string; user_id: string; role: AdminRole; email?: string | null };

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesPage,
});

function RolesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role")
      .order("role");
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function grant() {
    if (!email.trim()) { toast.error("Enter the user's email."); return; }
    setBusy(true);
    // Look up user via profiles table (email is stored there in this project).
    // Look up user via profiles (email is stored there).
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (pErr || !profile?.user_id) {
      setBusy(false);
      toast.error("No user found with that email. They must sign up first.");
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.user_id, role: role as any });

    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ROLE_LABEL[role]} role granted.`);
    setEmail("");
    load();
  }

  async function revoke(id: string) {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Role revoked.");
    load();
  }

  return (
    <div>
      <PageHeader title="Roles & permissions" description="Grant staff roles to other users. Admins have full access. Editors manage content. Moderators handle messages and reviews." />

      <AdminCard className="mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg"><UserPlus size={18} className="text-[#8B5CF6]" /> Grant a role</h3>
        <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50"
          >
            {ALL_ROLES.map((r) => (<option key={r} value={r}>{ROLE_LABEL[r]}</option>))}
          </select>
          <button
            onClick={grant}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] disabled:opacity-50"
          >
            {busy && <Loader2 size={14} className="animate-spin" />} Grant
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">The user must already have signed up. Roles are additive — the same user can hold more than one.</p>
      </AdminCard>

      <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg"><ShieldCheck size={18} className="text-[#06B6D4]" /> Current staff</h3>
      {loading ? (
        <div className="grid gap-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[#161616]/60 animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <AdminCard className="text-center py-8"><p className="text-muted-foreground text-sm">No staff roles assigned yet.</p></AdminCard>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <AdminCard key={r.id} className="!p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/20 inline-flex items-center justify-center ring-1 ring-white/10 shrink-0">
                <ShieldCheck size={16} className="text-[#8B5CF6]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs truncate text-muted-foreground">{r.user_id}</p>
                <p className="text-sm font-medium mt-0.5">{ROLE_LABEL[r.role] ?? r.role}</p>
              </div>
              <ConfirmDelete onConfirm={() => revoke(r.id)}>
                <button className="h-9 w-9 rounded-lg bg-white/5 hover:bg-destructive/20 hover:text-destructive inline-flex items-center justify-center transition" title="Revoke"><Trash2 size={14} /></button>
              </ConfirmDelete>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
