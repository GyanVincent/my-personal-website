import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/education")({
  component: () => (
    <CrudManager
      table="education"
      title="Education"
      description="Manage your academic timeline."
      primaryField="institution"
      secondaryField="qualification"
      defaults={{ institution: "", qualification: "", start_date: "", end_date: "", description: "", sort_order: 0 }}
      fields={[
        { key: "institution", label: "Institution" },
        { key: "qualification", label: "Qualification" },
        { key: "start_date", label: "Start date", type: "date" },
        { key: "end_date", label: "End date", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
