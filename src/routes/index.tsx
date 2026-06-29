import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LOGO_URL, SERVICES, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";
import { HeroAnimated } from "@/components/ui-custom/HeroAnimated";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.short} — ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.short} — ${SITE.tagline}` },
      { property: "og:description", content: SITE.description },
      { property: "og:image", content: LOGO_URL },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["home-testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("approved", true).order("sort_order").limit(3);
      return data ?? [];
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <HeroAnimated />

        {/* Stats */}
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { k: "20+", v: "Projects shipped" },
              { k: "7", v: "Service areas" },
              { k: "100%", v: "Client focus" },
              { k: "24/7", v: "Ask Vincent AI" },
            ].map((s, i) => (
              <div key={s.v} className="glass rounded-2xl p-5 hover-lift">
                <div className="text-3xl font-display font-bold text-gradient">{s.k}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <SectionHeader eyebrow="What I do" title="Services that turn ideas into products" description="From AI agents to mobile apps — pick what you need or talk to me about the whole journey." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.slice(0, 6).map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.05}>
              <Link to="/services" className="group block glass rounded-2xl p-6 hover:border-brand/50 hover-lift transition h-full">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition">
                  <s.icon size={22} />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-4 text-sm text-brand inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Learn more <ArrowRight size={14} />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-foreground hover:text-brand transition">
            View all services <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Testimonials snippet */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <SectionHeader eyebrow="Words from clients" title="Trusted by founders and product teams" />
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08}>
                <figure className="glass rounded-2xl p-6 h-full hover-lift">
                  <blockquote className="text-sm text-foreground/90 leading-relaxed">"{t.review}"</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <div className="font-medium text-foreground">{t.client_name}</div>
                    <div className="text-muted-foreground">{t.position}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/testimonials" className="text-sm text-foreground hover:text-brand">Read all testimonials →</Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <Reveal>
          <div className="relative glass rounded-3xl p-10 sm:p-14 overflow-hidden text-center hover-lift">
            <div className="absolute -inset-1 bg-gradient-to-br from-brand/20 via-transparent to-brand-violet/20" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-bold">Have a project in mind?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Tell me what you're building. I'll reply with a clear plan and timeline.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/contact" className="rounded-full px-6 py-3 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet shadow-[var(--shadow-glow)] hover:opacity-90 transition">Get in touch</Link>
                <Link to="/ask-vincent" className="rounded-full px-6 py-3 text-sm font-medium glass hover:text-brand transition">Ask Vincent AI</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
