// DashboardLayoutSkeleton — loading state for the full app layout

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-[240px] border-r border-border bg-sidebar flex flex-col gap-4 p-4 shrink-0">
        <div className="h-8 w-24 bg-muted rounded-lg" />
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border bg-background px-6 flex items-center gap-3">
          <div className="h-6 w-6 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>
        <div className="flex-1 p-6 flex flex-col gap-4">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
