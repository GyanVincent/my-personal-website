import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";
import { Dropzone } from "@/components/admin/Dropzone";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <CrudManager
      table="testimonials"
      title="Testimonials"
      description="Client reviews and recommendations."
      primaryField="client_name"
      secondaryField="review"
      imageField="avatar_url"
      defaults={{ client_name: "", position: "", company: "", review: "", avatar_url: "", approved: true, sort_order: 0 }}
      fields={[
        { key: "client_name", label: "Name" },
        { key: "position", label: "Position" },
        { key: "company", label: "Company" },
        { key: "review", label: "Review", type: "textarea" },
        { key: "avatar_url", label: "Profile photo", type: "custom",
          render: (v, set) => <Dropzone bucket="avatars" value={v} onChange={set} label="Drop profile photo" /> },
        { key: "approved", label: "Approved (show publicly)", type: "checkbox" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
