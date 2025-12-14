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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return error("Unauthorized", 401);

    const { id } = await params;
    const json = await req.json();
    const parsed = certificationSchema.partial().parse(json);

    const certification = await prisma.certification.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(certification);
  } catch (err) {
    console.error("PATCH /api/certifications/[id]", err);
    if (err instanceof z.ZodError) {
      return error((err as any).errors[0].message);
    }
    return error("Failed to update certification", 500);
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
    await prisma.certification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/certifications/[id]", err);
    return error("Failed to delete certification", 500);
  }
}
