import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    projectCount,
    blogCount,
    contactCount,
    unreadContactCount,
    totalBlogViews,
    featuredProjectCount,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.blogPost.count(),
    prisma.contact.count(),
    prisma.contact.count({ where: { read: false } }),
    prisma.blogPost.aggregate({ _sum: { views: true } }),
    prisma.project.count({ where: { featured: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Quick overview of your portfolio content.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Projects</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{projectCount}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{featuredProjectCount} featured</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Blog Posts</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{blogCount}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{totalBlogViews._sum.views || 0} total views</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Contacts</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{contactCount}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadContactCount > 0 ? (
              <span className="font-medium text-indigo-600">{unreadContactCount} unread</span>
            ) : (
              "All read"
            )}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Analytics</div>
          <div className="mt-2 text-lg font-bold text-foreground">Google Analytics</div>
          <p className="mt-1 text-sm text-muted-foreground">
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              View Dashboard &rarr;
            </a>
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Next steps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Manage projects in the Projects tab.</li>
          <li>Create and edit blog posts in the Blog tab.</li>
          <li>Configure defaults in Settings.</li>
        </ul>
      </div>
    </div>
  );
}
