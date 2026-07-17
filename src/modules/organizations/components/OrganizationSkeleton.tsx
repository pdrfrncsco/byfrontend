import { Card, Skeleton } from '@/components/ui'

export function SkeletonBase({ className }: { className?: string }) {
  return <Skeleton className={className} />
}

export function OrganizationListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} padding="md" className="space-y-md">
          <div className="flex items-center gap-md">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-xs">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="space-y-sm border-t border-outline-variant/20 pt-sm">
            <Skeleton className="h-3.5 w-1/2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function OrganizationDetailSkeleton() {
  return (
    <div className="container py-xl space-y-xl">
      <Card
        padding="none"
        className="overflow-hidden rounded-[2rem] border border-outline-variant/20 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)]"
      >
        <div className="grid gap-xl bg-[radial-gradient(circle_at_top_left,rgba(148,211,193,0.14),transparent_38%),radial-gradient(circle_at_top_right,rgba(66,153,225,0.12),transparent_36%),linear-gradient(180deg,rgba(7,16,29,0.92),rgba(7,16,29,0.76))] p-xl md:grid-cols-[auto_1fr_auto] md:items-center">
          <Skeleton className="h-32 w-32 rounded-3xl" />
          <div className="space-y-md">
            <Skeleton className="h-5 w-40 rounded-full" />
            <div className="space-y-sm">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <div className="flex flex-wrap gap-sm">
              <Skeleton className="h-8 w-44 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-sm">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-md md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} padding="md" className="space-y-sm text-center">
            <Skeleton className="mx-auto h-8 w-1/2" />
            <Skeleton className="mx-auto h-4 w-3/4" />
          </Card>
        ))}
      </div>

      <div className="space-y-lg">
        <Skeleton className="h-6 w-1/4" />
        <Card padding="none">
          <div className="border-b border-outline-variant/30 bg-surface-container-low p-md">
            <Skeleton className="h-5 w-1/3" />
          </div>
          <div className="space-y-md p-lg">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export function OrganizationSettingsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-lg px-gutter py-xl">
      <Skeleton className="h-5 w-1/6" />
      <Skeleton className="h-8 w-1/3" />
      <Card padding="md" className="flex items-center gap-lg">
        <Skeleton className="h-20 w-20 rounded-lg" />
        <div className="flex-1 space-y-sm">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-4.5 w-1/2" />
        </div>
      </Card>
      <Card padding="md" className="space-y-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 gap-md md:grid-cols-2">
            <div className="space-y-sm">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-sm">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
