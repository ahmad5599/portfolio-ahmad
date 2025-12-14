import { Button } from "@/components/ui/button";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || (!post.published && !isEnabled)) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <MotionWrapper className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-foreground">
          <Link href="/blog" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </Button>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{post.title}</h1>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {post.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-sm">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none text-lg text-muted-foreground">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
