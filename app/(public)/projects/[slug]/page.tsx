import { Button } from "@/components/ui/button";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600; // Revalidate every hour

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <MotionWrapper>
        <Button asChild variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-foreground">
          <Link href="/projects" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </Button>
      </MotionWrapper>

      <div className="grid gap-12 lg:grid-cols-2">
        <MotionWrapper delay={0.2} className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{project.title}</h1>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-lg text-muted-foreground">
            <p>{project.description}</p>
            {project.content && (
              <div className="mt-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            {project.liveUrl && (
              <Button asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Visit Site
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> View Code
                </a>
              </Button>
            )}
          </div>
        </MotionWrapper>

        <MotionWrapper delay={0.3} className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-lg">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </MotionWrapper>
      </div>
    </div>
  );
}
