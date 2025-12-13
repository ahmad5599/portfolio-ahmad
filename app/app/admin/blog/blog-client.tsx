"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  readTime: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  published: boolean;
  readTime: number;
};

type Props = {
  initialPosts: BlogPost[];
};

export default function BlogClient({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [form, setForm] = useState<FormState>({
    id: undefined,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    published: true,
    readTime: 5,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  const resetForm = () => {
    setForm({
      id: undefined,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      published: true,
      readTime: 5,
    });
  };

  async function refreshPosts() {
    const res = await fetch("/api/blog", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to refresh posts");
    const data: BlogPost[] = await res.json();
    setPosts(data);
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
      excerpt: form.excerpt.trim() || undefined,
      content: form.content.trim(),
      coverImage: form.coverImage.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      published: form.published,
      readTime: Number.isFinite(form.readTime) ? form.readTime : undefined,
    };

    try {
      const url = form.id ? `/api/blog/${form.id}` : "/api/blog";
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

      await refreshPosts();
      setStatus(form.id ? "Post updated" : "Post created");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Delete failed");
      }
      await refreshPosts();
      setStatus("Post deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(post: BlogPost) {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImage: post.coverImage ?? "",
      tags: post.tags.join(", "),
      published: post.published,
      readTime: post.readTime ?? 5,
    });
    setStatus(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {form.id ? "Edit Post" : "Create Post"}
            </h2>
            <p className="text-sm text-slate-600">Required: title, slug, content.</p>
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
            <label className="text-sm font-medium text-slate-800" htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="content">Content (Markdown)</label>
            <textarea
              id="content"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
              rows={10}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="readTime">Read Time (min)</label>
            <input
              id="readTime"
              type="number"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.readTime}
              onChange={(e) => setForm((f) => ({ ...f, readTime: Number(e.target.value) }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-800">Cover Image</label>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-800">
            <input
              id="published"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <label htmlFor="published">Published</label>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : form.id ? "Save changes" : "Create post"}
            </button>
            {status ? <span className="text-sm text-emerald-600">{status}</span> : null}
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Blog Posts</h2>
          <p className="text-sm text-slate-600">Click Edit to modify; Delete removes permanently.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No posts yet. Create one above.
                  </td>
                </tr>
              ) : (
                sortedPosts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{post.title}</td>
                    <td className="px-3 py-2 text-slate-600">{post.slug}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleEdit(post)}
                        className="mr-3 text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-rose-600 hover:text-rose-900"
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
