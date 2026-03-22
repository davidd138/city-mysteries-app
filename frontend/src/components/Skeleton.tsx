'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-midnight-700/30 rounded animate-pulse ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-case-file rounded-xl overflow-hidden">
      <div className="h-1 bg-midnight-700/20" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="card-case-file rounded-xl overflow-hidden">
        <div className="h-1.5 bg-midnight-700/20" />
        <div className="p-6 flex gap-6">
          <Skeleton className="w-20 h-20 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-case-file rounded-xl p-5 space-y-3">
            <Skeleton className="h-5 w-5 mx-auto rounded-full" />
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-case-file rounded-xl p-5 flex items-center gap-5">
          <Skeleton className="w-12 h-12 rounded hidden sm:block" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
