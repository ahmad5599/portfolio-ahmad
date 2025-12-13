import { prisma } from "@/lib/prisma";
import ProjectsClient from "./projects-client";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-slate-600">Add, edit, and organize your portfolio projects.</p>
      </div>
      <ProjectsClient initialProjects={projects} />
    </div>
  );
}
