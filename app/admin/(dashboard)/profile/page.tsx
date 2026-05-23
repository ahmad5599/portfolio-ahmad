import { prisma } from "@/lib/prisma";
import ProfileClient from "./profile-client";

export default async function AdminProfilePage() {
  const profile = await prisma.profile.findFirst();

  const profileForClient = profile
    ? {
        id: profile.id,
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        avatar: profile.avatar,
        resumeUrl: profile.resumeUrl,
        skills: profile.skills,
        socials: profile.socials as Record<string, string> | null,
      }
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-slate-600">Manage your personal information and skills.</p>
      </div>
      <ProfileClient initialProfile={profileForClient} />
    </div>
  );
}
