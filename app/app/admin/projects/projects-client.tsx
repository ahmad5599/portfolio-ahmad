"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  content: string | null;
  image: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  techStack: string;
  featured: boolean;
  order: number;
  githubUrl: string;
  liveUrl: string;
  image: string;
};

type Props = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [form, setForm] = useState<FormState>({
    id: undefined,
    title: "",
    slug: "",
    summary: "",
    techStack: "Next.js,TypeScript,Tailwind",
    featured: false,
    order: 0,
    githubUrl: "",
    liveUrl: "",
    image: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  }, [projects]);

  const resetForm = () => {
    setForm({
      id: undefined,
      title: "",
      slug: "",
      summary: "",
      techStack: "Next.js,TypeScript,Tailwind",
      featured: false,
      order: 0,
      githubUrl: "",
      liveUrl: "",
      image: "",
    });
  };

  async function refreshProjects() {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to refresh projects");
    const data: Project[] = await res.json();
    setProjects(data);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim() || undefined,
      techStack: form.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      featured: form.featured,
      order: Number.isFinite(form.order) ? form.order : 0,
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      image: form.image.trim() || undefined,
    };

    try {
      const url = form.id ? `/api/projects/${form.id}` : "/api/projects";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Request failed");
      }

      await refreshProjects();
      setStatus(form.id ? "Project updated" : "Project created");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Delete failed");
      }
      await refreshProjects();
      setStatus("Project deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(project: Project) {
    setForm({
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary ?? "",
      techStack: project.techStack.join(", "),
      featured: project.featured,
      order: project.order,
      githubUrl: project.githubUrl ?? "",
      liveUrl: project.liveUrl ?? "",
      image: project.image ?? "",
    });
    setStatus(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {form.id ? "Edit Project" : "Create Project"}
            </h2>
            <p className="text-sm text-slate-600">Required: title and slug. Tech stack is comma-separated.</p>
          </div>
          {form.id ? (
            <button
              type="button"
              className="text-sm text-slate-600 hover:text-slate-900"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-1 space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="title">Title</label>
            <input
              id="title"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-1 space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="slug">Slug</label>
            <input
              id="slug"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-800">Project Image</label>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="techStack">Tech stack (comma separated)</label>
            <input
              id="techStack"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.techStack}
              onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="order">Order</label>
            <input
              id="order"
              type="number"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="github">GitHub URL</label>
            <input
              id="github"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.githubUrl}
              onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="live">Live URL</label>
            <input
              id="live"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.liveUrl}
              onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-800">
            <input
              id="featured"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            <label htmlFor="featured">Featured</label>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : form.id ? "Save changes" : "Create project"}
            </button>
            {status ? <span className="text-sm text-emerald-600">{status}</span> : null}
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-600">Click a row to edit; delete removes permanently.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Tech</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Featured</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No projects yet. Create one above.
                  </td>
                </tr>
              ) : (
                sortedProjects.map((project) => (
                  <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{project.title}</td>
                    <td className="px-3 py-2 text-slate-700">{project.slug}</td>
                    <td className="px-3 py-2 text-slate-600 truncate max-w-xs">
                      {project.techStack.join(", ")}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{project.order}</td>
                    <td className="px-3 py-2 text-slate-700">{project.featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        type="button"
                        className="text-sm font-semibold text-slate-800 hover:text-slate-950"
                        onClick={() => handleEdit(project)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                        onClick={() => handleDelete(project.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
