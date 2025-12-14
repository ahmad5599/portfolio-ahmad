import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().nullable().transform((str) => str ? new Date(str) : null),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const educations = await prisma.education.findMany({
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    });
    return NextResponse.json(educations);
  } catch (err) {
    console.error("GET /api/education", err);
    return error("Failed to fetch education", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = educationSchema.parse(json);

    const education = await prisma.education.create({
      data: parsed,
    });

    return NextResponse.json(education);
  } catch (err) {
    console.error("POST /api/education", err);
    if (err instanceof z.ZodError) {
      return error((err as any).errors[0].message);
    }
    return error("Failed to create education", 500);
  }
}
