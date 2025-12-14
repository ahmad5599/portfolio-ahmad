"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string | null;
  order: number;
};

type FormState = {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  order: number;
};

type Props = {
  initialCertifications: Certification[];
};

export default function CertificationsClient({ initialCertifications }: Props) {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [form, setForm] = useState<FormState>({
    id: undefined,
    name: "",
    issuer: "",
    date: "",
    url: "",
    order: 0,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm({
      id: undefined,
      name: "",
      issuer: "",
      date: "",
      url: "",
      order: 0,
    });
  };

  async function refreshCertifications() {
    const res = await fetch("/api/certifications", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to refresh certifications");
    const data: Certification[] = await res.json();
    setCertifications(data);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      issuer: form.issuer.trim(),
      date: form.date,
      url: form.url.trim() || undefined,
      order: Number(form.order),
    };

    try {
      const url = form.id ? `/api/certifications/${form.id}` : "/api/certifications";
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

      await refreshCertifications();
      setStatus(form.id ? "Certification updated successfully." : "Certification created successfully.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(cert: Certification) {
    setForm({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date.split("T")[0],
      url: cert.url || "",
      order: cert.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this certification?")) {
      return;
    }

    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/certifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete certification");
      await refreshCertifications();
      setStatus("Certification deleted successfully.");
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
          {form.id ? "Edit Certification" : "Add Certification"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="issuer">Issuer</label>
            <Input
              id="issuer"
              required
              value={form.issuer}
              onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
              placeholder="Amazon Web Services"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="date">Date</label>
            <Input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="url">URL</label>
            <Input
              id="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
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

          {error && <p className="text-sm text-red-600">{error}</p>}
          {status && <p className="text-sm text-green-600">{status}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : form.id ? "Update Certification" : "Add Certification"}
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
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="flex items-start justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-foreground">{cert.name}</h3>
              <p className="text-sm text-muted-foreground">{cert.issuer}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(cert.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(cert)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(cert.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {certifications.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No certifications added yet.</p>
        )}
      </div>
    </div>
  );
}
