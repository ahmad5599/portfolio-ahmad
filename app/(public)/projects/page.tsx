import { Button } from "@/components/ui/button";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Projects | Portfolio",
  description: "A collection of my work and side projects.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 9; // Use 9 for a nice 3x3 grid
  const skip = (currentPage - 1) * limit;

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      orderBy: { order: "asc" },
      skip,
      take: limit,
    }),
    prisma.project.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <MotionWrapper className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Projects</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A selection of projects I've worked on, ranging from web applications to open source tools.
        </p>
      </MotionWrapper>

      <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <StaggerItem
            key={project.id}
            className={`group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${
              project.isPersonal ? "border-foreground border-2" : "border-border"
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {project.isPersonal && (
                <div className="absolute right-2 top-2 z-10 rounded-full bg-foreground px-2 py-1 text-xs font-medium text-background shadow-sm">
                  Personal
                </div>
              )}
              {project.image ? (
                <Link href={`/projects/${project.slug}`}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ) : (
                <Link href={`/projects/${project.slug}`} className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-muted-foreground transition-colors hover:bg-accent">
                  <span className="text-lg font-semibold text-foreground">{project.title}</span>
                </Link>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-semibold text-foreground">
                <Link href={`/projects/${project.slug}`} className="hover:underline">
                  {project.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                {project.summary || project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4">
                {project.githubUrl && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> Code
                    </a>
                  </Button>
                )}
                {project.liveUrl && (
                  <Button asChild size="sm" className="w-full">
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage <= 1}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          >
            <Link href={`/projects?page=${currentPage - 1}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Link>
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          >
            <Link href={`/projects?page=${currentPage + 1}`}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
