export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-600">Quick overview of your portfolio content.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Projects", "Blog Posts", "Contacts"].map((label) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">—</div>
            <p className="mt-1 text-sm text-slate-500">Counts coming soon.</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Next steps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Manage projects in the Projects tab.</li>
          <li>Create and edit blog posts in the Blog tab.</li>
          <li>Configure defaults in Settings.</li>
        </ul>
      </div>
    </div>
  );
}
