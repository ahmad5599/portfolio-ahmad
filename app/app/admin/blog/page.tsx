import { prisma } from "@/lib/prisma";
import BlogClient from "./blog-client";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-slate-600">Write and manage blog posts.</p>
      </div>
      <BlogClient initialPosts={posts} />
    </div>
  );
}
