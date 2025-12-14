import { Button } from "@/components/ui/button";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Blog | Portfolio",
  description: "Thoughts on software development, design, and more.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 9; // Use 9 for a nice 3x3 grid
  const skip = (currentPage - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where: { published: true } }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <MotionWrapper className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Thoughts, tutorials, and insights on software development and technology.
        </p>
      </MotionWrapper>

      <StaggerContainer className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <StaggerItem key={post.id} className="group flex flex-col space-y-3">
            <Link href={`/blog/${post.slug}`} className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
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
            </Link>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.createdAt.toISOString()}>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                {post.readTime && (
                  <>
                    <span>•</span>
                    <span>{post.readTime} min read</span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.excerpt && (
                <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
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
            <Link href={`/blog?page=${currentPage - 1}`}>
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
            <Link href={`/blog?page=${currentPage + 1}`}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
