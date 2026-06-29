
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Mail, MessageCircle, Github, Linkedin, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { LOGO_URL, SERVICES, SITE } from "@/lib/site";
import { Reveal, SectionHeader } from "@/components/ui-custom/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1, "Required").max(200),
  message: z.string().trim().min(10, "Tell me a bit more").max(4000),
  service: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const searchSchema = z.object({ service: z.string().optional() }).partial();

export const Route = createFileRoute("/contact")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: `Contact ${SITE.short}` },
      { name: "description", content: `Get in touch with Vincent Gyan. Email, WhatsApp, or send a message directly.` },
      { property: "og:title", content: `Contact ${SITE.short}` },
      { property: "og:description", content: "Reach Vincent Gyan to start a project." },
      { property: "og:url", content: "/contact" },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { service } = Route.useSearch();
  const [submitting, setSubmitting] = useState(false);
  const initialSubject = service ? `Inquiry: ${SERVICES.find((s) => s.slug === service)?.title ?? service}` : "";

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at").limit(1).maybeSingle()).data,
  });

  const displayEmail = profile?.email || SITE.email;
  const displayWhatsapp = profile?.whatsapp || SITE.whatsapp;
  const displayWhatsappDisplay = profile?.whatsapp || SITE.whatsappDisplay;
  const displayGithub = profile?.github_url || SITE.github;
  const displayLinkedin = profile?.linkedin_url || SITE.linkedin;
  const displayLocation = profile?.location || SITE.location;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service, subject: initialSubject },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name, email: data.email, subject: data.subject, message: data.message, service: data.service ?? null,
    });
    setSubmitting(false);
    if (error) { toast.error("Could not send message", { description: error.message }); return; }
    toast.success("Message sent — I'll get back to you soon.");
    reset({ name: "", email: "", subject: "", message: "", service: data.service });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <SectionHeader eyebrow="Contact" title="Let's talk" description="Have a question or a project? Send a message — or reach me directly." />

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10">
        <Reveal>
          <div className="space-y-4">
            <a href={`mailto:${displayEmail}`} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-brand/50 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand group-hover:scale-110 transition"><Mail size={20} /></div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="font-medium text-foreground break-all">{displayEmail}</p>
              </div>
            </a>
            <a href={`https://wa.me/${displayWhatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-brand/50 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand group-hover:scale-110 transition"><MessageCircle size={20} /></div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                <p className="font-medium text-foreground">{displayWhatsappDisplay}</p>
              </div>
            </a>
            <a href={displayGithub} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-brand/50 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand group-hover:scale-110 transition"><Github size={20} /></div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">GitHub</p>
                <p className="font-medium text-foreground">@vincentgyan</p>
              </div>
            </a>
            <a href={displayLinkedin} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-brand/50 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand group-hover:scale-110 transition"><Linkedin size={20} /></div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">LinkedIn</p>
                <p className="font-medium text-foreground">Vincent Gyan</p>
              </div>
            </a>
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand-violet/20 flex items-center justify-center text-brand"><MapPin size={20} /></div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{displayLocation}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" error={errors.name?.message}>
                <input {...register("name")} className={inputCls} placeholder="Your name" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" className={inputCls} placeholder="you@email.com" />
              </Field>
            </div>
            <Field label="Service (optional)">
              <select {...register("service")} className={inputCls} defaultValue={service ?? ""}>
                <option value="">Choose a service…</option>
                {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              </select>
            </Field>
            <Field label="Subject" error={errors.subject?.message}>
              <input {...register("subject")} className={inputCls} placeholder="What's this about?" />
            </Field>
            <Field label="Message" error={errors.message?.message}>
              <textarea {...register("message")} rows={6} className={inputCls} placeholder="Tell me about your project, timeline, and goals…" />
            </Field>
            <button
              type="submit" disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet shadow-[var(--shadow-glow)] disabled:opacity-50"
            >
              {submitting ? "Sending…" : (<>Send message <Send size={14} /></>)}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-input/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive mt-1 block">{error}</span>}
    </label>
  );
}
