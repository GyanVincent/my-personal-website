import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, Search, Lock } from "lucide-react";
import { AdminCard, PageHeader } from "./AdminCard";
import { ConfirmDelete } from "./ConfirmDelete";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminRoles } from "@/lib/admin/useRoles";
import { can, moduleForPath } from "@/lib/admin/rbac";


export type FieldDef = {
  key: string;
  label?: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "csv" | "date" | "url" | "custom";
  placeholder?: string;
  render?: (value: any, set: (v: any) => void) => ReactNode;
};

export function CrudManager<T extends { id: string }>({
  table,
  title,
  description,
  fields,
  defaults,
  primaryField = "title",
  secondaryField,
  imageField,
  orderBy = "created_at",
}: {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  defaults: Record<string, any>;
  primaryField?: string;
  secondaryField?: string;
  imageField?: string;
  orderBy?: string;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [draft, setDraft] = useState<any>(defaults);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { roles } = useAdminRoles();
  const module = moduleForPath(pathname);
  const canWrite = !!module && !!roles && can(roles, module, "write");
  const canDelete = !!module && !!roles && can(roles, module, "delete");


  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any).from(table).select("*").order(orderBy, { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as T[]);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table]);

  async function save() {
    if (!canWrite) { toast.error("You don't have permission to do that."); return; }
    setBusy(true);
    const payload = { ...draft };
    for (const f of fields) {
      if (f.type === "csv" && typeof payload[f.key] === "string") {
        payload[f.key] = payload[f.key].split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (f.type === "number" && payload[f.key] !== "" && payload[f.key] != null) {
        payload[f.key] = Number(payload[f.key]);
      }
      if (f.type === "date" && payload[f.key] === "") payload[f.key] = null;
    }
    const res = editing
      ? await (supabase as any).from(table).update(payload).eq("id", editing)
      : await (supabase as any).from(table).insert(payload);
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing ? "Updated" : "Created");
    setEditing(null); setDraft(defaults); setShowForm(false); load();
  }

  async function remove(id: string) {
    if (!canDelete) { toast.error("You don't have permission to delete."); return; }
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); load();

  }

  function edit(row: any) {
    const d: any = { ...row };
    for (const f of fields) if (f.type === "csv" && Array.isArray(d[f.key])) d[f.key] = d[f.key].join(", ");
    setDraft(d); setEditing(row.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = rows.filter((r: any) =>
    !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          canWrite ? (
            <button
              onClick={() => { setEditing(null); setDraft(defaults); setShowForm(!showForm); }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:shadow-lg hover:shadow-[#8B5CF6]/30 transition"
            >
              <Plus size={16} /> {showForm && !editing ? "Close" : "Add new"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground bg-white/5 ring-1 ring-white/5">
              <Lock size={12} /> Read-only
            </span>
          )
        }
      />


      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <AdminCard className="mb-6">
              <h3 className="font-semibold mb-4 text-lg">{editing ? "Edit" : "Create new"}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <FieldInput key={f.key} field={f} value={draft[f.key]} onChange={(v) => setDraft({ ...draft, [f.key]: v })} />
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={save}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] disabled:opacity-50"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => { setEditing(null); setDraft(defaults); setShowForm(false); }}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161616] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50"
        />
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-[#161616]/60 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard className="text-center py-10"><p className="text-muted-foreground text-sm">No items yet. Click "Add new" to get started.</p></AdminCard>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r: any, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <AdminCard className="!p-4 flex items-center gap-4">
                {imageField && r[imageField] && /\.(png|jpe?g|webp|gif|svg)$/i.test(r[imageField]) && (
                  <img src={r[imageField]} alt="" className="h-14 w-14 object-cover rounded-lg ring-1 ring-white/10 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r[primaryField] || r.name || r.id}</p>
                  {secondaryField && <p className="text-xs text-muted-foreground truncate mt-0.5">{r[secondaryField]}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {canWrite && (
                    <button onClick={() => edit(r)} className="h-9 w-9 rounded-lg bg-white/5 hover:bg-[#8B5CF6]/20 hover:text-[#8B5CF6] inline-flex items-center justify-center transition" title="Edit"><Edit2 size={14} /></button>
                  )}
                  {canDelete && (
                    <ConfirmDelete onConfirm={() => remove(r.id)}>
                      <button className="h-9 w-9 rounded-lg bg-white/5 hover:bg-destructive/20 hover:text-destructive inline-flex items-center justify-center transition" title="Delete"><Trash2 size={14} /></button>
                    </ConfirmDelete>
                  )}
                </div>

              </AdminCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  const label = field.label ?? field.key.replace(/_/g, " ");
  const baseClass = "w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50";
  const wrap = (input: ReactNode, full = false) => (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</span>
      {input}
    </label>
  );
  if (field.type === "custom" && field.render) return wrap(field.render(value, onChange), true);
  if (field.type === "textarea") return wrap(<textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseClass} />, true);
  if (field.type === "checkbox") return (
    <label className="flex items-center gap-2 sm:col-span-2">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#8B5CF6]" />
      <span className="text-sm">{label}</span>
    </label>
  );
  if (field.type === "number") return wrap(<input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={baseClass} />);
  if (field.type === "date") return wrap(<input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={baseClass} />);
  return wrap(<input type={field.type === "url" ? "url" : "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseClass} />);
}
