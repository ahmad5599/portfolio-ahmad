import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  url: z.string().optional(),
  order: z.number().int().default(0),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const certifications = await prisma.certification.findMany({
      orderBy: [{ order: "asc" }, { date: "desc" }],
    });
    return NextResponse.json(certifications);
  } catch (err) {
    console.error("GET /api/certifications", err);
    return error("Failed to fetch certifications", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = certificationSchema.parse(json);

    const certification = await prisma.certification.create({
      data: parsed,
    });

    return NextResponse.json(certification);
  } catch (err) {
    console.error("POST /api/certifications", err);
    if (err instanceof z.ZodError) {
      return error((err as any).errors[0].message);
    }
    return error("Failed to create certification", 500);
  }
}
