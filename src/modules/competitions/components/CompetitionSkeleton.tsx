import { Skeleton } from '@/components/ui'

export function CompetitionSkeleton() {
  return (
    <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-[2rem] border border-outline-variant/20 bg-surface p-lg"
        >
          <div className="flex items-center gap-lg">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-sm min-w-0">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center gap-md">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
