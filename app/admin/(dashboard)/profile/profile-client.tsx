"use client";

import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Profile = {
  id?: string;
  name: string;
  title: string;
  bio: string;
  avatar: string | null;
  resumeUrl: string | null;
  skills: string[];
};

type Props = {
  initialProfile: Profile | null;
};

export default function ProfileClient({ initialProfile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialProfile?.name || "",
    title: initialProfile?.title || "",
    bio: initialProfile?.bio || "",
    avatar: initialProfile?.avatar || "",
    resumeUrl: initialProfile?.resumeUrl || "",
    skills: initialProfile?.skills.join(", ") || "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("title", form.title.trim());
    formData.append("bio", form.bio.trim());
    if (form.avatar.trim()) formData.append("avatar", form.avatar.trim());
    if (form.resumeUrl.trim()) formData.append("resumeUrl", form.resumeUrl.trim());
    formData.append("skills", form.skills);

    try {
      const result = await updateProfile({ error: "" }, formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setStatus("Profile updated successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl rounded-lg border border-border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="title">Title</label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            required
            rows={4}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="skills">Skills (comma separated)</label>
          <textarea
            id="skills"
            rows={3}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Avatar</label>
          <ImageUpload
            value={form.avatar}
            onChange={(url) => setForm((f) => ({ ...f, avatar: url }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="resume">Resume URL</label>
          <Input
            id="resume"
            value={form.resumeUrl}
            onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {status && <p className="text-sm text-green-600">{status}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
