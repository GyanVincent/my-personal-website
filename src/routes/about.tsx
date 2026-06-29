import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MapPin, Mail } from "lucide-react";
import { LOGO_URL, PROFILE_URL, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${SITE.short}` },
      { name: "description", content: `${SITE.description} Learn more about my background, skills, and certifications.` },
      { property: "og:title", content: `About ${SITE.short}` },
      { property: "og:description", content: SITE.description },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at").limit(1).maybeSingle()).data,
  });
  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*").order("sort_order")).data ?? [],
  });
  const { data: certs = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => (await supabase.from("certificates").select("*").order("sort_order")).data ?? [],
  });

  const bySource = (skills ?? []).reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s); return acc;
  }, {} as any);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="About me" title={profile?.headline ?? SITE.tagline} description={profile?.bio || SITE.description} />

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10">
        <Reveal>
          <div className="glass rounded-3xl overflow-hidden hover-lift">
            <img src={profile?.avatar_url || PROFILE_URL} alt="Vincent Gyan" className="aspect-[4/5] w-full object-cover img-bw-hover" loading="lazy" />
            <div className="p-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} /> {profile?.location || SITE.location}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail size={14} /> <a href={`mailto:${SITE.email}`} className="hover:text-foreground break-all">{SITE.email}</a></div>
              {profile?.cv_url && (
                <a href={profile.cv_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet">
                  <Download size={14} /> Download CV
                </a>
              )}
            </div>
          </div>
        </Reveal>

        <div className="space-y-12">
          <Reveal>
            <h3 className="text-2xl font-bold mb-6">Skills & Stack</h3>
            <div className="space-y-8">
              {Object.entries(bySource).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="text-xs uppercase tracking-[0.2em] text-brand-glow mb-3">{cat}</h4>
                  <div className="space-y-3">
                    {items.map((s) => (
                      <div key={s.id}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-muted-foreground tabular-nums">{s.level}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand to-brand-violet rounded-full transition-all" style={{ width: `${s.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <h3 className="text-2xl font-bold mb-6">Certifications</h3>
            {certs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Certificates coming soon — admin can add them from the dashboard.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {certs.map((c) => (
                  <a key={c.id} href={c.file_url || "#"} target="_blank" rel="noreferrer" className="glass rounded-2xl p-5 hover:border-brand/50 transition block">
                    <h4 className="font-medium text-foreground">{c.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{c.issuer}</p>
                    {c.issued_at && <p className="text-xs text-muted-foreground mt-2">{new Date(c.issued_at).toLocaleDateString()}</p>}
                  </a>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-2">Let's work together</h3>
              <p className="text-sm text-muted-foreground">Ready to ship something real?</p>
              <Link to="/contact" className="mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet">Start a project</Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
