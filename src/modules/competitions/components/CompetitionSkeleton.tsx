import { Skeleton } from '@/components/ui'

export function CompetitionSkeleton() {
  return (
    <div className="space-y-md">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface p-lg"
        >
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-sm">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center gap-md">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  )
}
