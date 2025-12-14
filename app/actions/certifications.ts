"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  url: z.string().url().optional().or(z.literal("")),
  order: z.number().int().default(0),
});

export type CertificationState = {
  error?: string;
  success?: string;
};

export async function createCertification(prevState: CertificationState, formData: FormData): Promise<CertificationState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      name: formData.get("name"),
      issuer: formData.get("issuer"),
      date: formData.get("date"),
      url: formData.get("url") as string || undefined,
      order: Number(formData.get("order") || 0),
    };

    const validated = certificationSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.certification.create({
      data: validated.data,
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    return { success: "Certification created successfully" };
  } catch (error) {
    console.error("createCertification error:", error);
    return { error: "Failed to create certification" };
  }
}

export async function updateCertification(id: string, prevState: CertificationState, formData: FormData): Promise<CertificationState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      name: formData.get("name"),
      issuer: formData.get("issuer"),
      date: formData.get("date"),
      url: formData.get("url") as string || undefined,
      order: Number(formData.get("order") || 0),
    };

    const validated = certificationSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.certification.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    return { success: "Certification updated successfully" };
  } catch (error) {
    console.error("updateCertification error:", error);
    return { error: "Failed to update certification" };
  }
}

export async function deleteCertification(id: string): Promise<CertificationState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.certification.delete({
      where: { id },
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    return { success: "Certification deleted successfully" };
  } catch (error) {
    console.error("deleteCertification error:", error);
    return { error: "Failed to delete certification" };
  }
}
