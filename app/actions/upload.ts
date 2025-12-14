"use server";

import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { env } from "@/lib/env";

export async function uploadImage(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      throw new Error("Cloudinary not configured");
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "portfolio" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return { url: result.secure_url };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}
