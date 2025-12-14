"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Education = {
  id: string;
  degree: string;
  institution: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
};

type Props = {
  initialEducations: Education[];
};

export default function EducationClient({ initialEducations }: Props) {
  const router = useRouter();
  const [educations, setEducations] = useState<Education[]>(initialEducations);
  const [form, setForm] = useState<FormState>({
    id: undefined,
    degree: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    order: 0,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm({
      id: undefined,
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      order: 0,
    });
  };

  async function refreshEducations() {
    const res = await fetch("/api/education", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to refresh education");
    const data: Education[] = await res.json();
    setEducations(data);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const payload = {
      degree: form.degree.trim(),
      institution: form.institution.trim(),
      location: form.location.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate || null,
      description: form.description.trim() || undefined,
      order: Number(form.order),
    };

    try {
      const url = form.id ? `/api/education/${form.id}` : "/api/education";
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

      await refreshEducations();
      setStatus(form.id ? "Education updated successfully." : "Education created successfully.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(edu: Education) {
    setForm({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location || "",
      startDate: edu.startDate.split("T")[0],
      endDate: edu.endDate ? edu.endDate.split("T")[0] : "",
      description: edu.description || "",
      order: edu.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this education?")) {
      return;
    }

    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/education/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete education");
      await refreshEducations();
      setStatus("Education deleted successfully.");
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
          {form.id ? "Edit Education" : "Add Education"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="degree">Degree</label>
            <Input
              id="degree"
              required
              value={form.degree}
              onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
              placeholder="Bachelor of Science in Computer Science"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="institution">Institution</label>
            <Input
              id="institution"
              required
              value={form.institution}
              onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
              placeholder="University of Technology"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="location">Location</label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="New York, NY"
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
              {loading ? "Saving..." : form.id ? "Update Education" : "Add Education"}
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
        {educations.map((edu) => (
          <div
            key={edu.id}
            className="flex items-start justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-foreground">{edu.degree}</h3>
              <p className="text-sm text-muted-foreground">{edu.institution} • {edu.location}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(edu.startDate).toLocaleDateString()} -{" "}
                {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Present"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(edu)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(edu.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {educations.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No education added yet.</p>
        )}
      </div>
    </div>
  );
}
