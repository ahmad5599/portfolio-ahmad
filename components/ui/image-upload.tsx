"use client";

import { useState } from "react";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Upload preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-rose-500 p-1 text-primary-foreground shadow-sm hover:bg-rose-600"
            disabled={disabled || loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      ) : null}
      
      <div className="flex items-center gap-4">
        <label className={`
          flex cursor-pointer items-center justify-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:bg-muted/50
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
        `}>
          <span>{loading ? "Uploading..." : "Upload Image"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={disabled || loading}
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
}
