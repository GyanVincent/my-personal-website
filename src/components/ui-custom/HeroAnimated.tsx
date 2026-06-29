"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Github, Linkedin, MessageCircle, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PROFILE_URL, LOGO_URL, SITE } from "@/lib/site";
import { AnimatedHeading } from "./AnimatedHeading";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function HeroAnimated() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at").limit(1).maybeSingle()).data,
  });

  const displayName = profile?.full_name || "Vincent Gyan";
  const displayTagline = profile?.headline || SITE.tagline;
  const displayLocation = profile?.location || SITE.location;
  const displayBio = profile?.bio || SITE.description;
  const displayGithub = profile?.github_url || SITE.github;
  const displayLinkedin = profile?.linkedin_url || SITE.linkedin;
  const displayTwitter = profile?.twitter_url || SITE.twitter;
  const displayAvatar = profile?.avatar_url || PROFILE_URL;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-24 sm:pt-20 sm:pb-32">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground"
          >
            <Sparkles size={14} className="text-brand" />
            Available for AI & full-stack engagements
          </motion.div>
          <AnimatedHeading />
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl"
          >
            I'm {displayName} — an AI engineer and full-stack developer from {displayLocation}. {displayBio}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet shadow-[var(--shadow-glow)] hover:opacity-90 transition">
              Start a Project <ArrowRight size={16} />
            </Link>
            <Link to="/ask-vincent" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium glass hover:text-brand transition">
              <Sparkles size={16} /> Ask Vincent AI
            </Link>
            <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition px-3">
              See work →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex items-center gap-3"
          >
            <a aria-label="GitHub" href={displayGithub} className="p-2 rounded-md glass hover:text-brand transition hover-scale"><Github size={18} /></a>
            <a aria-label="LinkedIn" href={displayLinkedin} className="p-2 rounded-md glass hover:text-brand transition hover-scale"><Linkedin size={18} /></a>
            <a aria-label="WhatsApp" href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`} className="p-2 rounded-md glass hover:text-brand transition hover-scale"><MessageCircle size={18} /></a>
            <a aria-label="Email" href={`mailto:${SITE.email}`} className="p-2 rounded-md glass hover:text-brand transition hover-scale"><Mail size={18} /></a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto lg:ml-auto"
        >
          <div className="absolute -inset-6 bg-gradient-to-br from-brand/30 via-brand-violet/30 to-transparent blur-3xl rounded-full animate-pulse-slow" />
          <div className="relative aspect-square w-72 sm:w-80 rounded-3xl overflow-hidden ring-1 ring-brand/30 shadow-[var(--shadow-glow)] group">
            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover img-bw-hover" loading="eager" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
              <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-md ring-1 ring-brand/50 img-bw-hover" />
              <div>
                <p className="font-display font-semibold text-foreground leading-tight">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayTagline}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
