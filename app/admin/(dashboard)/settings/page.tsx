import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-slate-600">Configure defaults and integrations.</p>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
          <p className="text-sm text-slate-500">Update your personal information.</p>
          <ProfileForm user={{ name: user.name, email: user.email }} />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
          <p className="text-sm text-slate-500">Ensure your account is secure.</p>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
