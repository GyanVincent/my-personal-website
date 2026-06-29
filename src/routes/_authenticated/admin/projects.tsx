import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";
import { MultiDropzone, Dropzone } from "@/components/admin/Dropzone";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  component: () => (
    <CrudManager
      table="projects"
      title="Projects"
      description="Showcase your work with screenshots and links."
      primaryField="title"
      secondaryField="description"
      imageField="image_url"
      defaults={{ title: "", slug: "", description: "", tech: [], image_url: "", images: [], repo_url: "", live_url: "", featured: false, sort_order: 0 }}
      fields={[
        { key: "title", label: "Project name" },
        { key: "slug", label: "Slug (URL-friendly)" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "tech", label: "Technologies (comma-separated)", type: "csv" },
        { key: "repo_url", label: "GitHub URL", type: "url" },
        { key: "live_url", label: "Live demo URL", type: "url" },
        { key: "image_url", label: "Cover image", type: "custom",
          render: (v, set) => <Dropzone bucket="projects" value={v} onChange={set} label="Drop cover image" /> },
        { key: "images", label: "Screenshots", type: "custom",
          render: (v, set) => <MultiDropzone bucket="projects" value={v ?? []} onChange={set} /> },
        { key: "featured", label: "Featured project", type: "checkbox" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
