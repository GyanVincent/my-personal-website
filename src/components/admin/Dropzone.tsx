import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { uploadFile } from "@/lib/admin/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Dropzone({
  bucket,
  value,
  onChange,
  accept = { "image/*": [] },
  label = "Drop file here or click to upload",
  preview = true,
}: {
  bucket: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: Record<string, string[]>;
  label?: string;
  preview?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: false,
    onDrop: async (files) => {
      if (!files.length) return;
      setBusy(true);
      try {
        const url = await uploadFile(bucket, files[0]);
        onChange(url);
        toast.success("Uploaded");
      } catch (e: any) {
        toast.error(e.message ?? "Upload failed");
      } finally {
        setBusy(false);
      }
    },
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition",
          isDragActive ? "border-brand bg-brand/5" : "border-border hover:border-brand/50",
        )}
      >
        <input {...getInputProps()} />
        {busy ? (
          <Loader2 className="mx-auto animate-spin text-brand" size={22} />
        ) : (
          <Upload className="mx-auto text-muted-foreground" size={22} />
        )}
        <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      </div>
      {preview && value && (
        <div className="relative inline-block">
          {/\.(png|jpe?g|webp|gif|svg)$/i.test(value) ? (
            <img src={value} alt="" className="h-20 w-20 object-cover rounded-lg ring-1 ring-border" />
          ) : (
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-brand underline break-all">
              View file
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white inline-flex items-center justify-center"
            aria-label="Remove"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export function MultiDropzone({
  bucket,
  value,
  onChange,
  accept = { "image/*": [] },
}: {
  bucket: string;
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: Record<string, string[]>;
}) {
  const [busy, setBusy] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: true,
    onDrop: async (files) => {
      if (!files.length) return;
      setBusy(true);
      try {
        const urls = await Promise.all(files.map((f) => uploadFile(bucket, f)));
        onChange([...value, ...urls]);
        toast.success(`Uploaded ${urls.length} file(s)`);
      } catch (e: any) {
        toast.error(e.message ?? "Upload failed");
      } finally {
        setBusy(false);
      }
    },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition",
          isDragActive ? "border-brand bg-brand/5" : "border-border hover:border-brand/50",
        )}
      >
        <input {...getInputProps()} />
        {busy ? <Loader2 className="mx-auto animate-spin text-brand" size={22} /> : <Upload className="mx-auto text-muted-foreground" size={22} />}
        <p className="mt-2 text-xs text-muted-foreground">Drop images here or click to upload (multiple allowed)</p>
      </div>
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative group">
              <img src={url} alt="" className="aspect-square w-full object-cover rounded-lg ring-1 ring-border" />
              <button
                type="button"
                onClick={() => onChange(value.filter((u) => u !== url))}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-white inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-brand text-primary-foreground px-1.5 py-0.5 rounded">cover</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
