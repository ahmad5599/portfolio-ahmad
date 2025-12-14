import { Button } from "@/components/ui/button";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const [featuredProjects, recentPosts] = await Promise.all([
    prisma.project.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-background px-4 text-center md:px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <MotionWrapper className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
            Building digital products with purpose.
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
            I'm Muhammad Ahmad Hamid, a Full Stack Developer passionate about building accessible, pixel-perfect, and performant web experiences.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/projects">
                View My Work <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/contact">Contact Me</Link>
            </Button>
          </div>
        </MotionWrapper>
      </section>

      {/* Featured Projects Preview */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Projects</h2>
          <Link href="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View all projects &rarr;
          </Link>
        </div>
        <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.length > 0 ? (
            featuredProjects.map((project) => (
              <StaggerItem
                key={project.id}
                className={`group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${
                  project.isPersonal ? "border-foreground border-2" : "border-border"
                }`}
              >
                <Link href={`/projects/${project.slug}`} className="block h-full">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {project.isPersonal && (
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-foreground px-2 py-1 text-xs font-medium text-background shadow-sm">
                        Personal
                      </div>
                    )}
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-muted-foreground transition-colors hover:bg-accent">
                        <span className="text-lg font-semibold text-foreground">{project.title}</span>
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
              </StaggerItem>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No featured projects yet.</p>
          )}
        </StaggerContainer>
      </section>

      {/* Recent Posts Preview */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Recent Writing</h2>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Read all posts &rarr;
          </Link>
        </div>
        <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <StaggerItem
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {post.coverImage && (post.coverImage.startsWith("http") || post.coverImage.startsWith("/")) ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-muted-foreground transition-colors hover:bg-accent">
                        <span className="text-lg font-semibold text-foreground">{post.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No blog posts yet.</p>
          )}
        </StaggerContainer>
      </section>
    </div>
  );
}
