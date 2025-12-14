import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  readTime: z.number().int().optional(),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    return NextResponse.json(posts);
  } catch (err) {
    console.error("GET /api/blog", err);
    return error("Failed to fetch blog posts", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = blogPostSchema.parse(json);

    const post = await prisma.blogPost.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        content: parsed.content,
        coverImage: parsed.coverImage,
        tags: parsed.tags,
        published: parsed.published,
        readTime: parsed.readTime,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(err.issues.map((issue) => issue.message).join(", "), 400);
    }
    if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2002") {
      return error("Slug must be unique", 409);
    }
    console.error("POST /api/blog", err);
    return error("Failed to create blog post", 500);
  }
}
