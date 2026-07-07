interface SkeletonProps {
  className?: string
}

export function SkeletonBase({ className }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-bright/40 animate-pulse rounded-lg ${className}`}
      aria-hidden="true"
    />
  )
}

export function OrganizationListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-lg border border-outline-variant/30 space-y-md">
          <div className="flex items-center gap-md">
            <SkeletonBase className="w-12 h-12 rounded-lg shrink-0" />
            <div className="flex-1 space-y-xs">
              <SkeletonBase className="h-4 w-3/4" />
              <SkeletonBase className="h-3 w-1/3" />
            </div>
          </div>
          <div className="space-y-sm pt-sm border-t border-outline-variant/20">
            <SkeletonBase className="h-3.5 w-1/2" />
            <div className="flex justify-between items-center">
              <SkeletonBase className="h-3.5 w-1/3" />
              <SkeletonBase className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrganizationDetailSkeleton() {
  return (
    <div className="space-y-xl">
      {/* Header Banner Skeleton */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-xl">
        <div className="max-w-7xl mx-auto px-gutter flex items-start gap-lg">
          <SkeletonBase className="w-24 h-24 rounded-lg shrink-0" />
          <div className="flex-1 space-y-md">
            <div className="space-y-xs">
              <SkeletonBase className="h-8 w-1/2" />
              <SkeletonBase className="h-4 w-1/4" />
            </div>
            <SkeletonBase className="h-12 w-full max-w-xl" />
            <div className="flex gap-sm">
              <SkeletonBase className="h-10 w-28 rounded-lg" />
              <SkeletonBase className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Skeleton */}
      <div className="max-w-7xl mx-auto px-gutter grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-md border border-outline-variant/30 text-center space-y-sm">
            <SkeletonBase className="h-8 w-1/2 mx-auto" />
            <SkeletonBase className="h-4 w-3/4 mx-auto" />
          </div>
        ))}
      </div>

      {/* History and details Skeleton */}
      <div className="max-w-7xl mx-auto px-gutter space-y-lg">
        <SkeletonBase className="h-6 w-1/4" />
        <div className="glass-card p-0 border border-outline-variant/30 space-y-sm">
          <div className="p-md bg-surface-container-low border-b border-outline-variant/30">
            <SkeletonBase className="h-5 w-1/3" />
          </div>
          <div className="p-lg space-y-md">
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrganizationSettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-gutter py-xl space-y-lg">
      <SkeletonBase className="h-5 w-1/6" />
      <SkeletonBase className="h-8 w-1/3" />
      <div className="glass-card p-lg border border-outline-variant/30 flex items-center gap-lg">
        <SkeletonBase className="w-20 h-20 rounded-lg" />
        <div className="space-y-sm flex-1">
          <SkeletonBase className="h-9 w-28 rounded-lg" />
          <SkeletonBase className="h-4.5 w-1/2" />
        </div>
      </div>
      <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <SkeletonBase className="h-4 w-1/4" />
              <SkeletonBase className="h-10 w-full" />
            </div>
            <div className="space-y-sm">
              <SkeletonBase className="h-4 w-1/4" />
              <SkeletonBase className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
