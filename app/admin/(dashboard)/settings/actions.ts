"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
    revalidatePath("/admin/settings");
    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update profile" };
  }
}

export async function updatePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "All fields are required" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const isValid = await compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { error: "Incorrect current password" };
  }

  const passwordHash = await hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: "Password updated successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update password" };
  }
}
