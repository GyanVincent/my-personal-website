import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { LOGO_URL, SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} ${SITE.short} Blog` },
      { property: "og:title", content: `${params.slug} ${SITE.short} Blog` },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/blog/${params.slug}` },
      { property: "og:image", content: LOGO_URL },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  component: Post,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="text-2xl font-bold">Post not found</h1>
      <Link to="/blog" className="text-brand mt-4 inline-block">← Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="text-2xl font-bold">Couldn't load post</h1>
      <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
    </div>
  ),
});

function Post() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-6 py-32 text-muted-foreground">Loading…</div>;
  if (!post) throw notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back to blog</Link>
      <div className="mt-6 text-xs uppercase tracking-wider text-brand-glow">{post.category}</div>
      <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">{post.title}</h1>
      {post.published_at && <p className="mt-3 text-sm text-muted-foreground">{new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: "long" })}</p>}
      {post.cover_url && <img src={post.cover_url} alt="" className="mt-8 w-full aspect-[16/9] object-cover rounded-2xl img-bw-hover" loading="lazy" />}
      <div className="prose prose-invert prose-headings:font-display prose-a:text-brand prose-strong:text-foreground mt-10 max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
