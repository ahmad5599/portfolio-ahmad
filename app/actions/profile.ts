"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  avatar: z.string().optional(),
  resumeUrl: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export type ProfileState = {
  error?: string;
  success?: string;
};

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      name: formData.get("name"),
      title: formData.get("title"),
      bio: formData.get("bio"),
      avatar: formData.get("avatar") as string || undefined,
      resumeUrl: formData.get("resumeUrl") as string || undefined,
      skills: formData.get("skills")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
    };

    const validated = profileSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Check if profile exists, if not create one (assuming single profile system)
    const existing = await prisma.profile.findFirst();

    if (existing) {
      await prisma.profile.update({
        where: { id: existing.id },
        data: validated.data,
      });
    } else {
      await prisma.profile.create({
        data: validated.data,
      });
    }

    revalidatePath("/admin/profile");
    revalidatePath("/");
    revalidatePath("/about");
    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { error: "Failed to update profile" };
  }
}
