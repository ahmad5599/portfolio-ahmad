import { generateResumePDF } from "@/lib/pdf/resume-document";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [profile, experiences, educations, certifications, projects] =
      await Promise.all([
        prisma.profile.findFirst(),
        prisma.experience.findMany({ orderBy: { startDate: "desc" } }),
        prisma.education.findMany({ orderBy: { startDate: "desc" } }),
        prisma.certification.findMany({ orderBy: { date: "desc" } }),
        prisma.project.findMany({ orderBy: { order: "asc" } }),
      ]);

    if (!profile) {
      return new Response("Profile not found", { status: 404 });
    }

    const socials = (profile.socials ?? {}) as Record<string, string>;

    const buffer = await generateResumePDF({
      profile: {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        skills: profile.skills,
        socials,
      },
      experiences,
      educations,
      certifications,
      projects,
    });

    const bytes = new Uint8Array(buffer);

    const safeName = profile.name.replace(/\s+/g, "_");
    const filename = `${safeName}_CV.pdf`;

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CV generation error:", error);
    return new Response("Failed to generate CV", { status: 500 });
  }
}
