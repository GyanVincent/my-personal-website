import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { BLOG_CATEGORIES, LOGO_URL, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: `Blog ${SITE.short}` },
      { name: "description", content: "Notes on AI, software, Flutter, automation and prompt engineering." },
      { property: "og:title", content: `Blog ${SITE.short}` },
      { property: "og:description", content: "Writing on AI, software, mobile, and prompt engineering." },
      { property: "og:url", content: "/blog" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: Blog,
});

function Blog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof BLOG_CATEGORIES)[number]>("All");

  const { data: posts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").eq("published", true).order("published_at", { ascending: false })).data ?? [],
  });

  const filtered = posts.filter((p) => {
    if (cat !== "All" && p.category !== cat) return false;
    if (!q) return true;
    const hay = `${p.title} ${p.excerpt} ${p.tags?.join(" ") ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="Blog" title="Writing & notes" description="Practical takes on shipping AI, building product, and writing better prompts." />

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-10">
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full glass text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition",
                cat === c ? "bg-gradient-to-r from-brand to-brand-violet text-primary-foreground" : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No posts found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block glass rounded-2xl overflow-hidden h-full hover-lift hover:border-brand/50 transition">
                <div className="aspect-[16/9] bg-gradient-to-br from-brand/20 to-brand-violet/20 relative">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover img-bw-hover group-hover:scale-105 transition duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-display font-bold text-gradient opacity-40">
                      {p.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-[11px] uppercase tracking-wider text-brand-glow">{p.category}</div>
                  <h3 className="mt-2 font-display font-semibold text-lg text-foreground group-hover:text-gradient transition">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  {p.published_at && <p className="mt-4 text-xs text-muted-foreground">{new Date(p.published_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
