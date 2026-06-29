import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileBadge, ExternalLink, Trash2, Download } from "lucide-react";
import { Dropzone } from "@/components/admin/Dropzone";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";

export const Route = createFileRoute("/_authenticated/admin/cv")({
  component: CVPage,
});

function CVPage() {
  const [profile, setProfile] = useState<any>(null);
  const [downloads, setDownloads] = useState<number>(0);

  async function load() {
    const { data } = await supabase.from("profiles").select("*").order("created_at").limit(1).maybeSingle();
    setProfile(data);
    const { count } = await (supabase as any).from("cv_downloads").select("id", { count: "exact", head: true });
    setDownloads(count ?? 0);
  }
  useEffect(() => { load(); }, []);

  async function setCV(url: string | null) {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({ cv_url: url }).eq("id", profile.id);
    if (error) { toast.error(error.message); return; }
    toast.success(url ? "CV updated" : "CV removed");
    load();
  }

  return (
    <div>
      <PageHeader title="Resume / CV" description="Upload your latest CV. Visitors can download it from the website." />

      <div className="grid lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FileBadge size={16} className="text-[#06B6D4]" /> Current CV</h3>
          {profile?.cv_url ? (
            <div className="rounded-xl bg-white/3 p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0">
                  <FileBadge size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">CV document</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.cv_url}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={profile.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs bg-white/5 hover:bg-white/10"><ExternalLink size={12} /> View</a>
                <ConfirmDelete onConfirm={() => setCV(null)} title="Delete CV?" description="Visitors will no longer be able to download your CV.">
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs bg-destructive/20 text-destructive hover:bg-destructive/30"><Trash2 size={12} /> Delete</button>
                </ConfirmDelete>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No CV uploaded yet.</p>
          )}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{profile?.cv_url ? "Replace CV" : "Upload CV"}</p>
            <Dropzone bucket="cv" value={null} onChange={(url) => url && setCV(url)} accept={{ "application/pdf": [".pdf"] }} label="Drop PDF here" preview={false} />
          </div>
        </AdminCard>

        <AdminCard delay={0.1}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Download size={16} className="text-[#8B5CF6]" /> Total downloads</h3>
          <p className="text-5xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">{downloads}</p>
          <p className="text-xs text-muted-foreground mt-2">All-time CV downloads from the public site.</p>
        </AdminCard>
      </div>
    </div>
  );
}
