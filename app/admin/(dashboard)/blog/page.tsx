import { prisma } from "@/lib/prisma";
import BlogClient from "./blog-client";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blogPost.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const formattedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-slate-600">Write and manage blog posts.</p>
      </div>
      <BlogClient 
        initialPosts={formattedPosts} 
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}
