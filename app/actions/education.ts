"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export type EducationState = {
  error?: string;
  success?: string;
};

export async function createEducation(prevState: EducationState, formData: FormData): Promise<EducationState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      degree: formData.get("degree"),
      institution: formData.get("institution"),
      location: formData.get("location") as string || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") as string || undefined,
      description: formData.get("description") as string || undefined,
      order: Number(formData.get("order") || 0),
    };

    const validated = educationSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.education.create({
      data: validated.data,
    });

    revalidatePath("/admin/education");
    revalidatePath("/about");
    return { success: "Education created successfully" };
  } catch (error) {
    console.error("createEducation error:", error);
    return { error: "Failed to create education" };
  }
}

export async function updateEducation(id: string, prevState: EducationState, formData: FormData): Promise<EducationState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      degree: formData.get("degree"),
      institution: formData.get("institution"),
      location: formData.get("location") as string || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") as string || undefined,
      description: formData.get("description") as string || undefined,
      order: Number(formData.get("order") || 0),
    };

    const validated = educationSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.education.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/admin/education");
    revalidatePath("/about");
    return { success: "Education updated successfully" };
  } catch (error) {
    console.error("updateEducation error:", error);
    return { error: "Failed to update education" };
  }
}

export async function deleteEducation(id: string): Promise<EducationState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.education.delete({
      where: { id },
    });

    revalidatePath("/admin/education");
    revalidatePath("/about");
    return { success: "Education deleted successfully" };
  } catch (error) {
    console.error("deleteEducation error:", error);
    return { error: "Failed to delete education" };
  }
}
