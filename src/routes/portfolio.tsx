import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Github } from "lucide-react";
import { LOGO_URL, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: `Portfolio ${SITE.short}` },
      { name: "description", content: "Selected projects: AI agents, mobile apps, web platforms, and prompt-engineering pipelines." },
      { property: "og:title", content: `Portfolio ${SITE.short}` },
      { property: "og:description", content: "Selected projects by Vincent Gyan." },
      { property: "og:url", content: "/portfolio" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await supabase.from("projects").select("*").order("sort_order")).data ?? [],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="Portfolio" title="Selected work" description="A snapshot of recent builds across AI, web, and mobile." />

      {projects.length === 0 ? (
        <p className="text-muted-foreground">Projects will appear here once added from the admin dashboard.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <article className="glass rounded-2xl overflow-hidden h-full flex flex-col group hover-lift">
                <div className="aspect-[16/9] bg-gradient-to-br from-brand/20 via-brand-violet/10 to-transparent relative overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover img-bw-hover group-hover:scale-105 transition duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-display font-bold text-gradient opacity-50">
                      {p.title.charAt(0)}
                    </div>
                  )}
                  {p.featured && <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-brand/20 text-brand-glow border border-brand/40">Featured</span>}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-semibold text-xl">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 flex-1">{p.description}</p>
                  {p.tech?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t: string) => <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-secondary text-muted-foreground">{t}</span>)}
                    </div>
                  )}
                  <div className="mt-5 flex gap-2">
                    {p.live_url && p.live_url !== "#" && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 bg-brand/10 text-brand hover:bg-brand/20"><ExternalLink size={12} /> Live</a>}
                    {p.repo_url && p.repo_url !== "#" && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 bg-secondary text-foreground hover:bg-secondary/70"><Github size={12} /> Code</a>}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
