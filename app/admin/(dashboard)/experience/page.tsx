import { prisma } from "@/lib/prisma";
import ExperienceClient from "./experience-client";

export default async function AdminExperiencePage() {
  const experiences = await prisma.experience.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  const formattedExperiences = experiences.map((exp) => ({
    ...exp,
    startDate: exp.startDate.toISOString(),
    endDate: exp.endDate ? exp.endDate.toISOString() : null,
    createdAt: exp.createdAt.toISOString(),
    updatedAt: exp.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Experience</h1>
        <p className="text-slate-600">Manage your work experience.</p>
      </div>
      <ExperienceClient initialExperiences={formattedExperiences} />
    </div>
  );
}
