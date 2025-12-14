import { prisma } from "@/lib/prisma";
import EducationClient from "./education-client";

export default async function AdminEducationPage() {
  const educations = await prisma.education.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  const formattedEducations = educations.map((edu) => ({
    ...edu,
    startDate: edu.startDate.toISOString(),
    endDate: edu.endDate ? edu.endDate.toISOString() : null,
    createdAt: edu.createdAt.toISOString(),
    updatedAt: edu.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Education</h1>
        <p className="text-slate-600">Manage your education history.</p>
      </div>
      <EducationClient initialEducations={formattedEducations} />
    </div>
  );
}
