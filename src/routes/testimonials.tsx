import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { LOGO_URL, SITE } from "@/lib/site";
import { SectionHeader } from "@/components/ui-custom/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: `Testimonials ${SITE.short}` },
      { name: "description", content: "What clients and collaborators say about working with Vincent Gyan." },
      { property: "og:title", content: `Testimonials ${SITE.short}` },
      { property: "og:description", content: "Reviews from founders and product teams." },
      { property: "og:url", content: "/testimonials" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: Testimonials,
});

function Testimonials() {
  const { data: items = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").eq("approved", true).order("sort_order")).data ?? [],
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay({ delay: 4500, stopOnInteraction: false })]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="Testimonials" title="What clients say" description="A few words from the people I've worked with." />

      {items.length === 0 ? (
        <p className="text-muted-foreground">No testimonials yet.</p>
      ) : (
        <>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {items.map((t) => (
                <div key={t.id} className="pl-4 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3">
                  <figure className="glass rounded-2xl p-7 h-full flex flex-col hover-lift">
                    <Quote className="text-brand mb-4" />
                    <blockquote className="text-foreground/90 leading-relaxed flex-1">"{t.review}"</blockquote>
                    <figcaption className="mt-6 pt-5 border-t border-border/60">
                      <div className="font-display font-semibold text-foreground">{t.client_name}</div>
                      <div className="text-sm text-muted-foreground">{t.position}</div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {snaps.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === selected ? "w-8 bg-gradient-to-r from-brand to-brand-violet" : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
