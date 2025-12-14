import { auth } from "@/lib/auth";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/blog/${slug}`);
}
