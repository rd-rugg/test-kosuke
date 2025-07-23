import { StatsSkeleton, BreadcrumbSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// Page-specific skeleton for dashboard
function DashboardSkeleton() {
  return (
    <>
      {/* Header with breadcrumb and sidebar trigger */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-px bg-border" />
          <BreadcrumbSkeleton items={2} className="mr-2" />
        </div>
      </header>

      {/* Main dashboard content */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <StatsSkeleton />
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Loading() {
  return <DashboardSkeleton />;
}
