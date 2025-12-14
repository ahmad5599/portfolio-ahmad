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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const { id } = await params;
    const json = await req.json();
    const parsed = educationSchema.partial().parse(json);

    const education = await prisma.education.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(education);
  } catch (err) {
    console.error("PATCH /api/education/[id]", err);
    if (err instanceof z.ZodError) {
      return error((err as any).errors[0].message);
    }
    return error("Failed to update education", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const { id } = await params;
    await prisma.education.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/education/[id]", err);
    return error("Failed to delete education", 500);
  }
}
