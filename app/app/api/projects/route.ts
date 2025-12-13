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
  order: z.number().int().default(0),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(projects);
  } catch (err) {
    console.error("GET /api/projects", err);
    return error("Failed to fetch projects", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = projectSchema.parse(json);

    const project = await prisma.project.create({
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
        order: parsed.order,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(err.issues.map((issue) => issue.message).join(", "), 400);
    }
    if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2002") {
      return error("Slug must be unique", 409);
    }
    console.error("POST /api/projects", err);
    return error("Failed to create project", 500);
  }
}
