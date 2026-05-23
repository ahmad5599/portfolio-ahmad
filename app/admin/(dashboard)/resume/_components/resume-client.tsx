"use client";

import { RESUME_FIELDS, ResumeField } from "@/lib/pdf/resume-fields";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import ATSScoreCard from "./ats-score-card";

async function downloadPDF(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to generate PDF (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = objectUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

function DownloadButton({
  url,
  filename,
  label,
  variant = "primary",
}: {
  url: string;
  filename: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await downloadPDF(url, filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          variant === "primary"
            ? "ml-4 inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            : "inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        }
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {loading ? "Generating…" : label}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ResumeClient() {
  const fields = Object.entries(RESUME_FIELDS) as [ResumeField, (typeof RESUME_FIELDS)[ResumeField]][];

  return (
    <div className="space-y-8">
      {/* ATS Score */}
      <ATSScoreCard />
      {/* Full CV */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Full Curriculum Vitae</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete CV with all projects, experience, education, and certifications. This is also the public download available on your About page.
            </p>
          </div>
          <DownloadButton url="/api/resume" filename="CV.pdf" label="Download CV" variant="primary" />
        </div>
      </div>

      {/* Tailored Resumes */}
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Tailored Resumes</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Each resume is filtered to show only the most relevant projects for that role. Experience, education, and certifications are always included in full.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([key, config]) => (
            <div
              key={key}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{config.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {config.keywords.length === 0
                      ? "All projects included"
                      : `Keywords: ${config.keywords.slice(0, 4).join(", ")}${config.keywords.length > 4 ? "…" : ""}`}
                  </p>
                </div>
              </div>
              <DownloadButton
                url={`/api/resume/${key}`}
                filename={config.filename}
                label="Download"
                variant="secondary"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">How it works:</strong> Every download generates a fresh PDF directly from your database. Add a new project or certification in the admin panel and the next download will automatically include it — no manual updates needed.
      </div>
    </div>
  );
}
