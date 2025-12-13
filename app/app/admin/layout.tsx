import type { Metadata } from "next";
import AdminNav from "./_components/admin-nav";

export const metadata: Metadata = {
  title: "Admin | Portfolio",
  description: "Admin dashboard for managing portfolio content",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white/80 backdrop-blur">
          <div className="px-4 py-5 border-b border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</div>
            <div className="text-lg font-semibold text-slate-900">Portfolio CMS</div>
          </div>
          <div className="p-4">
            <AdminNav />
          </div>
        </aside>
        <main className="flex-1">
          <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm text-slate-500">Admin Control Panel</p>
                <h1 className="text-xl font-semibold text-slate-900">Manage your content</h1>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
