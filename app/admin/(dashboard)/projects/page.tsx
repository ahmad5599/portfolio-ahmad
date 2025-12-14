import { prisma } from "@/lib/prisma";
import ProjectsClient from "./projects-client";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.project.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const formattedProjects = projects.map((project) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-slate-600">Add, edit, and organize your portfolio projects.</p>
      </div>
      <ProjectsClient 
        initialProjects={formattedProjects} 
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}
