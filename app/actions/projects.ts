"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
  isPersonal: z.boolean().default(false),
  order: z.number().int().default(0),
});

export type ProjectState = {
  error?: string;
  success?: string;
};

export async function createProject(prevState: ProjectState, formData: FormData): Promise<ProjectState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      summary: formData.get("summary") as string || undefined,
      description: formData.get("description") as string || undefined,
      content: formData.get("content") as string || undefined,
      image: formData.get("image") as string || undefined,
      githubUrl: formData.get("githubUrl") as string || undefined,
      liveUrl: formData.get("liveUrl") as string || undefined,
      techStack: formData.get("techStack")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      featured: formData.get("featured") === "true",
      isPersonal: formData.get("isPersonal") === "true",
      order: Number(formData.get("order") || 0),
    };

    const validated = projectSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.project.create({
      data: validated.data,
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: "Project created successfully" };
  } catch (error) {
    console.error("createProject error:", error);
    return { error: "Failed to create project" };
  }
}

export async function updateProject(id: string, prevState: ProjectState, formData: FormData): Promise<ProjectState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      summary: formData.get("summary") as string || undefined,
      description: formData.get("description") as string || undefined,
      content: formData.get("content") as string || undefined,
      image: formData.get("image") as string || undefined,
      githubUrl: formData.get("githubUrl") as string || undefined,
      liveUrl: formData.get("liveUrl") as string || undefined,
      techStack: formData.get("techStack")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      featured: formData.get("featured") === "true",
      isPersonal: formData.get("isPersonal") === "true",
      order: Number(formData.get("order") || 0),
    };

    const validated = projectSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.project.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: "Project updated successfully" };
  } catch (error) {
    console.error("updateProject error:", error);
    return { error: "Failed to update project" };
  }
}

export async function deleteProject(id: string): Promise<ProjectState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: "Project deleted successfully" };
  } catch (error) {
    console.error("deleteProject error:", error);
    return { error: "Failed to delete project" };
  }
}
