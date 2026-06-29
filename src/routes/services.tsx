import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LOGO_URL, SERVICES, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services ${SITE.short}` },
      { name: "description", content: "Website & mobile development, AI agents, automation, prompt engineering, API integration, and technical consultation." },
      { property: "og:title", content: `Services ${SITE.short}` },
      { property: "og:description", content: "Engineering services: web, mobile, AI agents, automation, prompts, APIs, consulting." },
      { property: "og:url", content: "/services" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

function Services() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="Services" title="What I can build for you" description="Pick a single engagement or combine several — every project ships production-ready and well-documented." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.05}>
            <article className="glass rounded-2xl p-6 h-full flex flex-col group hover-lift hover:border-brand/50 transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition">
                <s.icon size={24} />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground flex-1">{s.description}</p>
              <Link
                to="/contact"
                search={{ service: s.slug } as never}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet hover:opacity-90 transition"
              >
                Contact about this <ArrowRight size={14} />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
