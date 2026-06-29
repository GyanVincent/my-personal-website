import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Mail, MailOpen, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleRead(m: any) {
    const { error } = await (supabase as any).from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    load();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); load();
  }

  const filtered = rows.filter((r) => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const unread = rows.filter((r) => !r.read).length;

  return (
    <div>
      <PageHeader title="Messages" description={`${rows.length} total · ${unread} unread`} />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages…" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161616] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 rounded-xl bg-[#161616]/60 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <AdminCard className="text-center py-10"><p className="text-muted-foreground text-sm">No messages.</p></AdminCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <AdminCard>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!m.read && <span className="h-2 w-2 rounded-full bg-[#8B5CF6]" />}
                      <p className="font-medium">{m.name}</p>
                      <span className="text-xs text-muted-foreground">&lt;{m.email}&gt;</span>
                    </div>
                    <p className="text-sm text-[#06B6D4] mt-1">{m.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                    <button onClick={() => toggleRead(m)} className="h-9 w-9 rounded-lg bg-white/5 hover:bg-[#8B5CF6]/20 inline-flex items-center justify-center" title={m.read ? "Mark unread" : "Mark read"}>
                      {m.read ? <MailOpen size={14} /> : <Mail size={14} />}
                    </button>
                    <ConfirmDelete onConfirm={() => remove(m.id)}>
                      <button className="h-9 w-9 rounded-lg bg-white/5 hover:bg-destructive/20 hover:text-destructive inline-flex items-center justify-center"><Trash2 size={14} /></button>
                    </ConfirmDelete>
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">{m.message}</p>
                {m.service && <p className="mt-2 text-xs text-muted-foreground">Service: <span className="text-[#06B6D4]">{m.service}</span></p>}
              </AdminCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
