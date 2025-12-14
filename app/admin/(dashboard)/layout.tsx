import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminNav from "./_components/admin-nav";

export const metadata: Metadata = {
  title: "Admin | Portfolio",
  description: "Admin dashboard for managing portfolio content",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur">
          <div className="px-4 py-5 border-b border-border">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin</div>
            <div className="text-lg font-semibold text-foreground">Portfolio CMS</div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <AdminNav />
          </div>
        </aside>
        <main className="flex-1">
          <div className="border-b border-border bg-background/70 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Admin Control Panel</p>
                <h1 className="text-xl font-semibold text-foreground">Manage your content</h1>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
