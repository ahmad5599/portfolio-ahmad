import { auth } from "@/lib/auth";
import { generateResumePDF } from "@/lib/pdf/resume-document";
import {
  filterProjectsByField,
  RESUME_FIELDS,
  ResumeField,
} from "@/lib/pdf/resume-fields";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ field: string }> }
) {
  try {
    // Auth check — tailored resumes are admin-only
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { field } = await params;

    // Validate field
    if (!(field in RESUME_FIELDS)) {
      return new Response(
        `Invalid field. Valid options: ${Object.keys(RESUME_FIELDS).join(", ")}`,
        { status: 400 }
      );
    }

    const fieldConfig = RESUME_FIELDS[field as ResumeField];

    const [profile, experiences, educations, certifications, allProjects] =
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

    const projects = filterProjectsByField(allProjects, fieldConfig.keywords);
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
      fieldLabel: fieldConfig.label,
    });

    const bytes = new Uint8Array(buffer);

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fieldConfig.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Tailored resume generation error:", error);
    return new Response("Failed to generate resume", { status: 500 });
  }
}
