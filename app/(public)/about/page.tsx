import { Button } from "@/components/ui/button";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { Certification, Education, Experience, Project } from "@prisma/client";
import { Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata = {
  title: "About Me | Portfolio",
  description: "Learn more about my background, skills, and experience.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function AboutPage() {
  const [profile, experiences, educations, certifications, personalProjects] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.experience.findMany({ orderBy: { startDate: "desc" } }),
    prisma.education.findMany({ orderBy: { startDate: "desc" } }),
    prisma.certification.findMany({ orderBy: { date: "desc" } }),
    prisma.project.findMany({
      where: { isPersonal: true },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p>Please seed the database with profile information.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="mx-auto max-w-3xl space-y-12">
        <MotionWrapper className="space-y-6 text-center">
          {profile.avatar && (
            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">About Me</h1>
          <p className="text-xl text-muted-foreground">
            {profile.title}
          </p>
          {profile.resumeUrl && (
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download Resume
                </a>
              </Button>
            </div>
          )}
        </MotionWrapper>

        <MotionWrapper delay={0.2} className="prose prose-neutral dark:prose-invert max-w-none text-lg text-muted-foreground">
          <p>{profile.bio}</p>
        </MotionWrapper>

        <div className="space-y-6">
          <MotionWrapper delay={0.3}>
            <h2 className="text-2xl font-bold text-foreground">Experience</h2>
          </MotionWrapper>
          <div className="space-y-8">
            {experiences.map((exp: Experience, index: number) => (
              <MotionWrapper key={exp.id} delay={0.4 + index * 0.1} className="border-l-2 border-border pl-4">
                <h3 className="text-xl font-semibold text-foreground">{exp.position}</h3>
                <p className="text-sm text-muted-foreground">
                  {exp.company} | {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                </p>
                <div className="mt-2 text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{exp.description || ""}</ReactMarkdown>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <MotionWrapper delay={0.8}>
            <h2 className="text-2xl font-bold text-foreground">Skills</h2>
          </MotionWrapper>
          <StaggerContainer delay={0.9} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {profile.skills.map((skill: string) => (
              <StaggerItem key={skill} className="rounded-lg border border-border bg-card p-4 text-center font-medium text-foreground shadow-sm">
                {skill}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <div className="space-y-6">
          <MotionWrapper delay={1.0}>
            <h2 className="text-2xl font-bold text-foreground">Education</h2>
          </MotionWrapper>
          <div className="grid gap-6 sm:grid-cols-2">
            {educations.map((edu: Education, index: number) => (
              <MotionWrapper key={edu.id} delay={1.1 + index * 0.1} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                <p className="text-sm text-muted-foreground">
                  {edu.institution} | {new Date(edu.startDate).getFullYear()}-{edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                </p>
              </MotionWrapper>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <MotionWrapper delay={1.2}>
            <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
          </MotionWrapper>
          <div className="grid gap-6 sm:grid-cols-2">
            {certifications.map((cert: Certification, index: number) => (
              <MotionWrapper key={cert.id} delay={1.3 + index * 0.1} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{cert.name}</h3>
                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    View Certificate <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </MotionWrapper>
            ))}
          </div>
        </div>

        {personalProjects.length > 0 && (
          <div className="space-y-6">
            <MotionWrapper delay={1.4}>
              <h2 className="text-2xl font-bold text-foreground">Personal Projects</h2>
            </MotionWrapper>
            <div className="grid gap-6 sm:grid-cols-2">
              {personalProjects.map((project: Project, index: number) => (
                <MotionWrapper key={project.id} delay={1.5 + index * 0.1} className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md">
                  <Link href={`/projects/${project.slug}`} className="block h-full">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {project.summary || project.description}
                      </p>
                    </div>
                  </Link>
                </MotionWrapper>
              ))}
            </div>
          </div>
        )}

        <MotionWrapper delay={1.3} className="flex justify-center pt-8">
          <Button asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </MotionWrapper>
      </div>
    </div>
  );
}
