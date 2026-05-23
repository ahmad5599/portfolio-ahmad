"use client";

import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Socials = {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  languages?: string;
};

type Profile = {
  id?: string;
  name: string;
  title: string;
  bio: string;
  avatar: string | null;
  resumeUrl: string | null;
  skills: string[];
  socials?: Socials | null;
};

type Props = {
  initialProfile: Profile | null;
};

export default function ProfileClient({ initialProfile }: Props) {
  const router = useRouter();
  const socials = (initialProfile?.socials ?? {}) as Socials;
  const [form, setForm] = useState({
    name: initialProfile?.name || "",
    title: initialProfile?.title || "",
    bio: initialProfile?.bio || "",
    avatar: initialProfile?.avatar || "",
    resumeUrl: initialProfile?.resumeUrl || "",
    skills: initialProfile?.skills.join(", ") || "",
    email: socials.email || "",
    phone: socials.phone || "",
    location: socials.location || "",
    linkedin: socials.linkedin || "",
    github: socials.github || "",
    portfolio: socials.portfolio || "",
    languages: socials.languages || "",
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
    formData.append("email", form.email.trim());
    formData.append("phone", form.phone.trim());
    formData.append("location", form.location.trim());
    formData.append("linkedin", form.linkedin.trim());
    formData.append("github", form.github.trim());
    formData.append("portfolio", form.portfolio.trim());
    formData.append("languages", form.languages.trim());

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
          <label className="text-sm font-medium text-foreground" htmlFor="resume">Resume URL (legacy)</label>
          <Input
            id="resume"
            value={form.resumeUrl}
            onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))}
          />
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Contact &amp; Social Links</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="phone">Phone</label>
              <Input
                id="phone"
                type="tel"
                placeholder="+92 300 0000000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="location">Location</label>
              <Input
                id="location"
                placeholder="City, Country"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="linkedin">LinkedIn URL</label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={form.linkedin}
                onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="github">GitHub URL</label>
              <Input
                id="github"
                placeholder="https://github.com/yourusername"
                value={form.github}
                onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="portfolio">Portfolio Website</label>
              <Input
                id="portfolio"
                placeholder="https://yourportfolio.com"
                value={form.portfolio}
                onChange={(e) => setForm((f) => ({ ...f, portfolio: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">CV Extra Sections</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="languages">Spoken Languages</label>
              <p className="text-xs text-muted-foreground">Comma-separated. Example: English (Native), Urdu (Fluent)</p>
              <Input
                id="languages"
                placeholder="English (Native), Urdu (Native)"
                value={form.languages}
                onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
              />
            </div>
          </div>
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
