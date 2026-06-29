import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";
import { Dropzone } from "@/components/admin/Dropzone";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: () => (
    <CrudManager
      table="certificates"
      title="Certificates"
      description="Upload and manage your certifications."
      primaryField="title"
      secondaryField="issuer"
      imageField="image_url"
      defaults={{ title: "", issuer: "", issued_at: "", category: "", file_url: "", image_url: "", sort_order: 0 }}
      fields={[
        { key: "title", label: "Certificate name" },
        { key: "issuer", label: "Issuing organization" },
        { key: "issued_at", label: "Date issued", type: "date" },
        { key: "category", label: "Category" },
        { key: "image_url", label: "Certificate image", type: "custom",
          render: (v, set) => <Dropzone bucket="certificates" value={v} onChange={set} label="Drop certificate image" /> },
        { key: "file_url", label: "Certificate PDF", type: "custom",
          render: (v, set) => <Dropzone bucket="certificates" value={v} onChange={set} accept={{ "application/pdf": [".pdf"] }} label="Drop PDF file" /> },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
