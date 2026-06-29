import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";
import { Dropzone } from "@/components/admin/Dropzone";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: () => (
    <CrudManager
      table="blog_posts"
      title="Blog"
      description="Write and publish articles. Drafts stay private until published."
      primaryField="title"
      secondaryField="excerpt"
      imageField="cover_url"
      defaults={{ title: "", slug: "", excerpt: "", content: "", category: "Artificial Intelligence", tags: [], cover_url: "", seo_description: "", published: false }}
      fields={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "category", label: "Category" },
        { key: "tags", label: "Tags (comma-separated)", type: "csv" },
        { key: "excerpt", label: "Excerpt", type: "textarea" },
        { key: "content", label: "Content (markdown / HTML)", type: "textarea" },
        { key: "seo_description", label: "SEO description", type: "textarea" },
        { key: "cover_url", label: "Featured image", type: "custom",
          render: (v, set) => <Dropzone bucket="blog" value={v} onChange={set} label="Drop cover image" /> },
        { key: "published", label: "Published", type: "checkbox" },
      ]}
    />
  ),
});
