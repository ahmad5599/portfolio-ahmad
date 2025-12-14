"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Project = Prisma.ProjectGetPayload<{}>;

type FormState = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  content: string;
  techStack: string;
  featured: boolean;
  isPersonal: boolean;
  order: number;
  githubUrl: string;
  liveUrl: string;
  image: string;
};

type Props = {
  initialProjects: Project[];
  totalPages: number;
  currentPage: number;
};

export default function ProjectsClient({ initialProjects, totalPages, currentPage }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [form, setForm] = useState<FormState>({
    id: undefined,
    title: "",
    slug: "",
    summary: "",
    description: "",
    content: "",
    techStack: "Next.js,TypeScript,Tailwind",
    featured: false,
    isPersonal: false,
    order: 0,
    githubUrl: "",
    liveUrl: "",
    image: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  }, [projects]);

  const resetForm = () => {
    setForm({
      id: undefined,
      title: "",
      slug: "",
      summary: "",
      description: "",
      content: "",
      techStack: "Next.js,TypeScript,Tailwind",
      featured: false,
      isPersonal: false,
      order: 0,
      githubUrl: "",
      liveUrl: "",
      image: "",
    });
  };

  async function refreshProjects() {
    const res = await fetch(`/api/projects?page=${currentPage}`, { cache: "no-store" });
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
      slug: slugify(form.slug),
      summary: form.summary.trim() || undefined,
      description: form.description.trim() || undefined,
      content: form.content.trim() || undefined,
      techStack: form.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      featured: form.featured,
      isPersonal: form.isPersonal,
      order: Number(form.order),
      githubUrl: form.githubUrl.trim() || undefined,
      liveUrl: form.liveUrl.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    try {
      const url = form.id ? `/api/projects/${form.id}` : "/api/projects";
      const method = form.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || "Something went wrong");
        } catch (e) {
          if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
             throw e;
          }
          throw new Error(`Request failed with status ${res.status}`);
        }
      }

      await refreshProjects();
      setStatus(form.id ? "Project updated successfully." : "Project created successfully.");
      resetForm();
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
      summary: project.summary || "",
      description: project.description || "",
      content: project.content || "",
      techStack: project.techStack.join(","),
      featured: project.featured,
      isPersonal: project.isPersonal || false,
      order: project.order,
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      image: project.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      await refreshProjects();
      setStatus("Project deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card text-card-foreground p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {form.id ? "Edit Project" : "Create New Project"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="title">Title</label>
            <input
              id="title"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: slugify(title) }));
              }}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="slug">Slug</label>
            <input
              id="slug"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="content">Content (Markdown)</label>
            <textarea
              id="content"
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="image">Image URL</label>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="tech">Tech Stack (comma sep)</label>
            <input
              id="tech"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.techStack}
              onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="order">Order</label>
            <input
              id="order"
              type="number"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="github">GitHub URL</label>
            <input
              id="github"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.githubUrl}
              onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="live">Live URL</label>
            <input
              id="live"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.liveUrl}
              onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <input
              id="featured"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            <label htmlFor="featured">Featured</label>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <input
              id="isPersonal"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={form.isPersonal}
              onChange={(e) => setForm((f) => ({ ...f, isPersonal: e.target.checked }))}
            />
            <label htmlFor="isPersonal">Personal Project</label>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Saving..." : form.id ? "Save changes" : "Create project"}
            </button>
            {status ? <span className="text-sm text-emerald-600">{status}</span> : null}
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card text-card-foreground p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">Click a row to edit; delete removes permanently.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Tech</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Featured</th>
                <th className="px-3 py-2">Personal</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No projects yet. Create one above.
                  </td>
                </tr>
              ) : (
                sortedProjects.map((project) => (
                  <tr key={project.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-3 py-2 font-medium text-foreground">{project.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{project.slug}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-xs">
                      {project.techStack.join(", ")}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{project.order}</td>
                    <td className="px-3 py-2 text-muted-foreground">{project.featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{project.isPersonal ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        type="button"
                        className="text-sm font-semibold text-foreground hover:text-slate-950"
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
        
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`?page=${currentPage - 1}`)}
              disabled={currentPage <= 1}
              className="rounded border border-border p-1 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push(`?page=${currentPage + 1}`)}
              disabled={currentPage >= totalPages}
              className="rounded border border-border p-1 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
