"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const experienceSchema = z.object({
  position: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  description: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  order: z.number().int().default(0),
});

export type ExperienceState = {
  error?: string;
  success?: string;
};

export async function createExperience(prevState: ExperienceState, formData: FormData): Promise<ExperienceState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      position: formData.get("position"),
      company: formData.get("company"),
      location: formData.get("location") as string || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") as string || undefined,
      description: formData.get("description") as string || undefined,
      technologies: formData.get("technologies")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      order: Number(formData.get("order") || 0),
    };

    const validated = experienceSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.experience.create({
      data: validated.data,
    });

    revalidatePath("/admin/experience");
    revalidatePath("/about");
    return { success: "Experience created successfully" };
  } catch (error) {
    console.error("createExperience error:", error);
    return { error: "Failed to create experience" };
  }
}

export async function updateExperience(id: string, prevState: ExperienceState, formData: FormData): Promise<ExperienceState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      position: formData.get("position"),
      company: formData.get("company"),
      location: formData.get("location") as string || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") as string || undefined,
      description: formData.get("description") as string || undefined,
      technologies: formData.get("technologies")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      order: Number(formData.get("order") || 0),
    };

    const validated = experienceSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.experience.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/admin/experience");
    revalidatePath("/about");
    return { success: "Experience updated successfully" };
  } catch (error) {
    console.error("updateExperience error:", error);
    return { error: "Failed to update experience" };
  }
}

export async function deleteExperience(id: string): Promise<ExperienceState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.experience.delete({
      where: { id },
    });

    revalidatePath("/admin/experience");
    revalidatePath("/about");
    return { success: "Experience deleted successfully" };
  } catch (error) {
    console.error("deleteExperience error:", error);
    return { error: "Failed to delete experience" };
  }
}
