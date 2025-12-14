import { prisma } from "@/lib/prisma";
import { Certification } from "@prisma/client";
import CertificationsClient from "./certifications-client";

export default async function AdminCertificationsPage() {
  const certifications = await prisma.certification.findMany({
    orderBy: [{ order: "asc" }, { date: "desc" }],
  });

  const formattedCertifications = certifications.map((cert: Certification) => ({
    ...cert,
    date: cert.date.toISOString(),
    createdAt: cert.createdAt.toISOString(),
    updatedAt: cert.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Certifications</h1>
        <p className="text-slate-600">Manage your certifications and awards.</p>
      </div>
      <CertificationsClient initialCertifications={formattedCertifications} />
    </div>
  );
}
