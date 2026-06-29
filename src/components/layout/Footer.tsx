import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { LOGO_URL, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="" className="h-9 w-9 rounded-md ring-1 ring-brand/40" />
            <span className="font-display font-semibold tracking-tight text-lg">
              <span className="text-foreground">Vin</span><span className="text-gradient">TechAI</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            {SITE.description}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a aria-label="GitHub" href={SITE.github} className="p-2 rounded-md glass hover:text-brand transition"><Github size={18} /></a>
            <a aria-label="LinkedIn" href={SITE.linkedin} className="p-2 rounded-md glass hover:text-brand transition"><Linkedin size={18} /></a>
            <a aria-label="WhatsApp" href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`} className="p-2 rounded-md glass hover:text-brand transition"><MessageCircle size={18} /></a>
            <a aria-label="Email" href={`mailto:${SITE.email}`} className="p-2 rounded-md glass hover:text-brand transition"><Mail size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/portfolio" className="hover:text-foreground">Portfolio</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href={`mailto:${SITE.email}`} className="hover:text-foreground break-all">{SITE.email}</a></li>
            <li><a href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`} className="hover:text-foreground">{SITE.whatsappDisplay}</a></li>
            <li>{SITE.location}</li>
            <li><Link to="/ask-vincent" className="hover:text-foreground">Ask Vincent AI →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Vincent Gyan. All rights reserved.</p>
          <p>Built with <span className="text-gradient font-medium">VinTechAI</span> craft.</p>
        </div>
      </div>
    </footer>
  );
}
