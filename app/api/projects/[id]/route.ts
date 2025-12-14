import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  isPersonal: z.boolean().default(false),
  order: z.number().int().default(0),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = projectSchema.parse(json);

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: parsed.title,
        slug: parsed.slug,
        summary: parsed.summary,
        description: parsed.description,
        content: parsed.content,
        image: parsed.image,
        githubUrl: parsed.githubUrl || null,
        liveUrl: parsed.liveUrl || null,
        techStack: parsed.techStack,
        featured: parsed.featured,
        isPersonal: parsed.isPersonal,
        order: parsed.order,
      },
    });

    return NextResponse.json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(err.issues.map((issue) => issue.message).join(", "), 400);
    }
    if (typeof err === "object" && err && "code" in err) {
      const code = (err as { code?: string }).code;
      if (code === "P2025") return error("Not found", 404);
      if (code === "P2002") return error("Slug must be unique", 409);
    }
    console.error(`PUT /api/projects/${id}`, err);
    return error("Failed to update project", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2025") {
      return error("Not found", 404);
    }
    console.error(`DELETE /api/projects/${id}`, err);
    return error("Failed to delete project", 500);
  }
}
