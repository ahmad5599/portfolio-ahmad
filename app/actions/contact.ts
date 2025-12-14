"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteContact(id: string) {
  try {
    await prisma.contact.delete({
      where: { id },
    });
    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { success: false, error: "Failed to delete contact" };
  }
}

export async function toggleReadStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.contact.update({
      where: { id },
      data: { read: !currentStatus },
    });
    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Error updating contact status:", error);
    return { success: false, error: "Failed to update contact status" };
  }
}
