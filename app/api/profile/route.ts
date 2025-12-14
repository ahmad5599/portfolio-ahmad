import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  avatar: z.string().optional(),
  resumeUrl: z.string().optional(),
  skills: z.array(z.string()).default([]),
  socials: z.any().optional(),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const profile = await prisma.profile.findFirst();
    return NextResponse.json(profile || {});
  } catch (err) {
    console.error("GET /api/profile", err);
    return error("Failed to fetch profile", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const json = await req.json();
    const parsed = profileSchema.parse(json);

    // Check if profile exists
    const existing = await prisma.profile.findFirst();

    let profile;
    if (existing) {
      profile = await prisma.profile.update({
        where: { id: existing.id },
        data: parsed,
      });
    } else {
      profile = await prisma.profile.create({
        data: parsed,
      });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("POST /api/profile", err);
    if (err instanceof z.ZodError) {
      return error((err as any).errors[0].message);
    }
    return error("Failed to save profile", 500);
  }
}
