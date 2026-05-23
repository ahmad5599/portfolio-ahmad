import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreResume } from "@/lib/pdf/ats-scorer";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

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
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const socials = (profile.socials ?? {}) as Record<string, string>;

    const result = scoreResume({
      profile: {
        bio: profile.bio,
        skills: profile.skills,
        socials,
      },
      experiences,
      educations,
      certifications,
      projects,
    });

    return Response.json(result);
  } catch (error) {
    console.error("[ATS score] error:", error);
    return Response.json({ error: "Failed to compute score" }, { status: 500 });
  }
}
