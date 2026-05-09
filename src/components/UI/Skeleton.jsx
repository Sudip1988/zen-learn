export function Skeleton({ className = "" }) {
  return (
    <div className={`bg-zen-surface animate-pulse rounded-lg ${className}`} />
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <Skeleton className="w-32 h-20 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

export function CatalogueCardSkeleton() {
  return (
    <div className="bg-zen-surface rounded-2xl p-4 space-y-3">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
