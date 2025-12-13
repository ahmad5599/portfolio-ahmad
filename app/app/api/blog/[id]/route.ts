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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = blogPostSchema.parse(json);

    const post = await prisma.blogPost.update({
      where: { id },
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

    return NextResponse.json(post);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(err.issues.map((issue) => issue.message).join(", "), 400);
    }
    if (typeof err === "object" && err && "code" in err) {
      const code = (err as { code?: string }).code;
      if (code === "P2025") return error("Not found", 404);
      if (code === "P2002") return error("Slug must be unique", 409);
    }
    console.error(`PUT /api/blog/${id}`, err);
    return error("Failed to update blog post", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2025") {
      return error("Not found", 404);
    }
    console.error(`DELETE /api/blog/${id}`, err);
    return error("Failed to delete blog post", 500);
  }
}
