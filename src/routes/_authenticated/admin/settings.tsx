import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";
import { Dropzone } from "@/components/admin/Dropzone";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("site_settings").select("*").limit(1).maybeSingle();
      setS(data ?? { site_title: "VinTechAI", site_description: "", seo_keywords: "", logo_url: null, favicon_url: null, socials: {} });
    })();
  }, []);

  async function save() {
    if (!s) return;
    setBusy(true);
    let res;
    if (s.id) res = await (supabase as any).from("site_settings").update(s).eq("id", s.id);
    else res = await (supabase as any).from("site_settings").insert(s).select().single();
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Settings saved");
    if (res.data) setS(res.data);
  }

  if (!s) return <div className="text-muted-foreground">Loading…</div>;
  const base = "w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50";
  const setSocial = (k: string, v: string) => setS({ ...s, socials: { ...(s.socials ?? {}), [k]: v } });

  return (
    <div>
      <PageHeader
        title="Site settings"
        description="Global site configuration and SEO."
        action={
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold">General</h3>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Site title</span>
            <input value={s.site_title ?? ""} onChange={(e) => setS({ ...s, site_title: e.target.value })} className={base} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Site description</span>
            <textarea rows={3} value={s.site_description ?? ""} onChange={(e) => setS({ ...s, site_description: e.target.value })} className={base} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">SEO keywords (comma-separated)</span>
            <input value={s.seo_keywords ?? ""} onChange={(e) => setS({ ...s, seo_keywords: e.target.value })} className={base} />
          </label>
        </AdminCard>

        <AdminCard delay={0.1} className="space-y-4">
          <h3 className="font-semibold">Branding</h3>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Logo</p>
            <Dropzone bucket="logos" value={s.logo_url} onChange={(url) => setS({ ...s, logo_url: url })} label="Upload logo" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Favicon</p>
            <Dropzone bucket="logos" value={s.favicon_url} onChange={(url) => setS({ ...s, favicon_url: url })} accept={{ "image/*": [], "image/x-icon": [".ico"] }} label="Upload favicon" />
          </div>
        </AdminCard>

        <AdminCard className="lg:col-span-3 space-y-4">
          <h3 className="font-semibold">Social media</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["github", "linkedin", "twitter", "youtube", "instagram", "facebook"].map((k) => (
              <label key={k} className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{k}</span>
                <input value={s.socials?.[k] ?? ""} onChange={(e) => setSocial(k, e.target.value)} placeholder={`https://${k}.com/…`} className={base} />
              </label>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
