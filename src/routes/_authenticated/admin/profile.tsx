import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";
import { Dropzone } from "@/components/admin/Dropzone";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at").limit(1).maybeSingle();
      setProfile(data);
    })();
  }, []);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", profile.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  if (!profile) return <div className="text-muted-foreground">Loading…</div>;

  const text: [string, string, "text" | "textarea"][] = [
    ["full_name", "Full name", "text"],
    ["headline", "Professional title", "text"],
    ["bio", "Biography", "textarea"],
    ["location", "Location", "text"],
    ["email", "Email", "text"],
    ["whatsapp", "WhatsApp", "text"],
    ["github_url", "GitHub URL", "text"],
    ["linkedin_url", "LinkedIn URL", "text"],
    ["twitter_url", "Twitter / X URL", "text"],
  ];

  const baseInput = "w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50";

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Public-facing personal information shown on the website."
        action={
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <AdminCard>
          <h3 className="font-semibold mb-4">Profile picture</h3>
          <Dropzone bucket="avatars" value={profile.avatar_url} onChange={(url) => setProfile({ ...profile, avatar_url: url })} label="Drop avatar image" />
        </AdminCard>
        <AdminCard delay={0.1} className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Personal info</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {text.map(([k, label, type]) => (
              <label key={k} className={`block ${type === "textarea" ? "sm:col-span-2" : ""}`}>
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</span>
                {type === "textarea"
                  ? <textarea rows={5} value={profile[k] ?? ""} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} className={baseInput} />
                  : <input value={profile[k] ?? ""} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} className={baseInput} />}
              </label>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
