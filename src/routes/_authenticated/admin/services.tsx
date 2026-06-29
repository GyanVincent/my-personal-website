import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: () => (
    <CrudManager
      table="services"
      title="Services"
      description="Services you offer to clients."
      primaryField="name"
      secondaryField="description"
      defaults={{ name: "", description: "", icon: "Sparkles", sort_order: 0 }}
      fields={[
        { key: "name", label: "Service name" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "icon", label: "Icon name (lucide-react)", placeholder: "Sparkles, Code, Smartphone, Brain…" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
