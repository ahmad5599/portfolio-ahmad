import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const experienceSchema = z.object({
  position: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().nullable().transform((str) => str ? new Date(str) : null),
  description: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  order: z.number().int().default(0),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const experiences = await prisma.experience.findMany({
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    });
    return NextResponse.json(experiences);
  } catch (err) {
    console.error("GET /api/experience", err);
    return error("Failed to fetch experiences", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = experienceSchema.parse(json);

    const experience = await prisma.experience.create({
      data: parsed,
    });

    return NextResponse.json(experience);
  } catch (err) {
    console.error("POST /api/experience", err);
    if (err instanceof z.ZodError) {
      return error((err as any).errors[0].message);
    }
    return error("Failed to create experience", 500);
  }
}
