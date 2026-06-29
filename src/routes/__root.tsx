import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { LOGO_URL, SITE } from "@/lib/site";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet">Go home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full px-4 py-2 text-sm font-medium text-primary-foreground bg-gradient-to-r from-brand to-brand-violet">Try again</button>
          <a href="/" className="rounded-full px-4 py-2 text-sm font-medium border border-border">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0f2c" },
      { title: SITE.name },
      { name: "description", content: SITE.description },
      { name: "author", content: "Vincent Gyan" },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.short },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "VinTechAi" },
      { property: "og:title", content: "VinTechAi" },
      { name: "twitter:title", content: "VinTechAi" },
      { name: "description", content: "Vincent's Digital Suite offers comprehensive web and mobile development, AI automation, and technical consultation services." },
      { property: "og:description", content: "Vincent's Digital Suite offers comprehensive web and mobile development, AI automation, and technical consultation services." },
      { name: "twitter:description", content: "Vincent's Digital Suite offers comprehensive web and mobile development, AI automation, and technical consultation services." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/2BPPmOrcBOcy3w1DRT43sf5LlK43/social-images/social-1780784699153-vintechai.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/2BPPmOrcBOcy3w1DRT43sf5LlK43/social-images/social-1780784699153-vintechai.webp" },
    ],
    links: [
      { rel: "icon", type: "image/jpeg", href: LOGO_URL },
      { rel: "apple-touch-icon", href: LOGO_URL },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Vincent Gyan",
          jobTitle: "AI Engineer & Full-Stack Developer",
          url: "/",
          address: { "@type": "PostalAddress", addressLocality: "Sunyani", addressCountry: "GH" },
          email: SITE.email,
          image: LOGO_URL,
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh flex flex-col bg-background relative overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.04]" aria-hidden />
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] -z-10 bg-[var(--gradient-hero)] blur-3xl" aria-hidden />
        <Nav />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      </div>
    </QueryClientProvider>
  );
}
