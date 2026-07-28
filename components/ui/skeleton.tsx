import { cn } from "@/lib/cn";

/**
 * Shape-matched loading placeholders.
 *
 * Rules the whole app follows:
 *  - render on `isLoading` (first load) only; on `isFetching` keep stale data
 *  - block sizes must match the real content, or the page jumps when it lands
 *  - loaded-but-empty is an empty state, never a skeleton
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-md bg-slate-200", className)}
    />
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        count === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="mt-5 h-8 w-16" />
          <Skeleton className="mt-3 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TaskTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="ml-auto h-5 w-32" />
      </div>

      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-5 w-5" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-1.5 h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 ml-[22px] h-4 w-3/4" />
      <div className="mt-4 ml-[22px] flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function TaskBoardSkeleton() {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        <Skeleton className="h-14 w-full rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>

      <div className="hidden gap-5 lg:grid lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, column) => (
          <div key={column}>
            <Skeleton className="mb-3 h-5 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, row) => (
                <TaskCardSkeleton key={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function EmployeeTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
        <Skeleton className="ml-auto h-10 w-36 rounded-lg" />
      </div>

      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-48" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <Skeleton className="h-5 w-40" />
      <div className="mt-6 space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end border-t border-line pt-5">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
