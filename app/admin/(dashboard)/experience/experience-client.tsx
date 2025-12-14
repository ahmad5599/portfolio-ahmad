"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Experience = {
  id: string;
  position: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  technologies: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id?: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string;
  order: number;
};

type Props = {
  initialExperiences: Experience[];
};

export default function ExperienceClient({ initialExperiences }: Props) {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [form, setForm] = useState<FormState>({
    id: undefined,
    position: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    technologies: "",
    order: 0,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm({
      id: undefined,
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      technologies: "",
      order: 0,
    });
  };

  async function refreshExperiences() {
    const res = await fetch("/api/experience", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to refresh experiences");
    const data: Experience[] = await res.json();
    setExperiences(data);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const payload = {
      position: form.position.trim(),
      company: form.company.trim(),
      location: form.location.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate || null,
      description: form.description.trim() || undefined,
      technologies: form.technologies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      order: Number(form.order),
    };

    try {
      const url = form.id ? `/api/experience/${form.id}` : "/api/experience";
      const method = form.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      await refreshExperiences();
      setStatus(form.id ? "Experience updated successfully." : "Experience created successfully.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(exp: Experience) {
    setForm({
      id: exp.id,
      position: exp.position,
      company: exp.company,
      location: exp.location || "",
      startDate: exp.startDate.split("T")[0],
      endDate: exp.endDate ? exp.endDate.split("T")[0] : "",
      description: exp.description || "",
      technologies: exp.technologies.join(", "),
      order: exp.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this experience?")) {
      return;
    }

    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/experience/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete experience");
      await refreshExperiences();
      setStatus("Experience deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm h-fit">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {form.id ? "Edit Experience" : "Add Experience"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="position">Position</label>
            <Input
              id="position"
              required
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              placeholder="Software Engineer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="company">Company</label>
            <Input
              id="company"
              required
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="location">Location</label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="San Francisco, CA"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="startDate">Start Date</label>
              <Input
                id="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="endDate">End Date</label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Leave blank if current</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="technologies">Technologies</label>
            <Input
              id="technologies"
              value={form.technologies}
              onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))}
              placeholder="React, Node.js, TypeScript (comma separated)"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="order">Order</label>
            <Input
              id="order"
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="w-full min-h-[100px] rounded-md border border-border px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {status && <p className="text-sm text-green-600">{status}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : form.id ? "Update Experience" : "Add Experience"}
            </Button>
            {form.id && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="flex items-start justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-foreground">{exp.position}</h3>
              <p className="text-sm text-muted-foreground">{exp.company} • {exp.location}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(exp.startDate).toLocaleDateString()} -{" "}
                {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
              </p>
              {exp.technologies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {exp.technologies.map((tech) => (
                    <span key={tech} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(exp)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(exp.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No experience added yet.</p>
        )}
      </div>
    </div>
  );
}
