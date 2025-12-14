"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  totalPages: number;
  currentPage: number;
};

export default function BlogClient({ initialPosts, totalPages, currentPage }: Props) {
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

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

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
    const res = await fetch(`/api/blog?page=${currentPage}`, { cache: "no-store" });
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
      slug: slugify(form.slug),
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
        const text = await res.text();
        try {
          const body = JSON.parse(text);
          throw new Error(body?.error || "Request failed");
        } catch (e) {
           if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
             throw e;
          }
          throw new Error(`Request failed with status ${res.status}`);
        }
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
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {form.id ? "Edit Post" : "Create Post"}
            </h2>
            <p className="text-sm text-muted-foreground">Required: title, slug, content.</p>
          </div>
          {form.id ? (
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-1 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="title">Title</label>
            <input
              id="title"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: slugify(title) }));
              }}
              required
            />
          </div>
          <div className="sm:col-span-1 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="slug">Slug</label>
            <input
              id="slug"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="content">Content (Markdown)</label>
            <textarea
              id="content"
              className="w-full rounded-md border border-border px-3 py-2 text-sm font-mono"
              rows={10}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="readTime">Read Time (min)</label>
            <input
              id="readTime"
              type="number"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.readTime}
              onChange={(e) => setForm((f) => ({ ...f, readTime: Number(e.target.value) }))}
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium text-foreground">Cover Image</label>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <input
              id="published"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <label htmlFor="published">Published</label>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Saving..." : form.id ? "Save changes" : "Create post"}
            </button>
            {status ? <span className="text-sm text-emerald-600">{status}</span> : null}
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">Click Edit to modify; Delete removes permanently.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
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
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No posts yet. Create one above.
                  </td>
                </tr>
              ) : (
                sortedPosts.map((post) => (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-3 py-2 font-medium text-foreground">{post.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{post.slug}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
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
