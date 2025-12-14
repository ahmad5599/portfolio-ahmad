export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="h-12 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
          <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
