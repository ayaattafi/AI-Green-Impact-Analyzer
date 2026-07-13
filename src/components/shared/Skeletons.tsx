import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card space-y-3 rounded-xl p-5', className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card rounded-xl p-6', className)}>
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="flex h-64 items-end justify-between gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
    </div>
  );
}

export function RowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
    </div>
  );
}
