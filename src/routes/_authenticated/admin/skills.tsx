import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/skills")({
  component: () => (
    <CrudManager
      table="skills"
      title="Skills"
      description="Technical skills and proficiency."
      primaryField="name"
      secondaryField="category"
      defaults={{ name: "", category: "General", level: 80, percentage: 80, sort_order: 0 }}
      fields={[
        { key: "name", label: "Skill name" },
        { key: "category", label: "Category", placeholder: "e.g. AI, Mobile, Web" },
        { key: "level", label: "Level (0-100)", type: "number" },
        { key: "percentage", label: "Percentage", type: "number" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
