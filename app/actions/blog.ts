"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  readTime: z.number().int().optional(),
});

export type BlogState = {
  error?: string;
  success?: string;
};

export async function createPost(prevState: BlogState, formData: FormData): Promise<BlogState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt") as string || undefined,
      content: formData.get("content"),
      coverImage: formData.get("coverImage") as string || undefined,
      tags: formData.get("tags")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      published: formData.get("published") === "true",
      readTime: formData.get("readTime") ? Number(formData.get("readTime")) : undefined,
    };

    const validated = blogPostSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.blogPost.create({
      data: validated.data,
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: "Post created successfully" };
  } catch (error) {
    console.error("createPost error:", error);
    return { error: "Failed to create post" };
  }
}

export async function updatePost(id: string, prevState: BlogState, formData: FormData): Promise<BlogState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt") as string || undefined,
      content: formData.get("content"),
      coverImage: formData.get("coverImage") as string || undefined,
      tags: formData.get("tags")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      published: formData.get("published") === "true",
      readTime: formData.get("readTime") ? Number(formData.get("readTime")) : undefined,
    };

    const validated = blogPostSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.blogPost.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: "Post updated successfully" };
  } catch (error) {
    console.error("updatePost error:", error);
    return { error: "Failed to update post" };
  }
}

export async function deletePost(id: string): Promise<BlogState> {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.blogPost.delete({
      where: { id },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: "Post deleted successfully" };
  } catch (error) {
    console.error("deletePost error:", error);
    return { error: "Failed to delete post" };
  }
}
