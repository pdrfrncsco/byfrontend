import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PlayerListSkeleton() {
  return (
    <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} variant="glass" padding="none">
          <CardContent className="space-y-md p-lg">
            <div className="flex items-start gap-md">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-sm">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function PlayerDetailSkeleton() {
  return (
    <div className="space-y-lg">
      <Card variant="glass" padding="none">
        <CardContent className="space-y-md p-xl">
          <div className="flex items-start gap-lg">
            <Skeleton className="h-20 w-20 rounded-3xl" />
            <div className="flex-1 space-y-sm">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </CardContent>
      </Card>
      <div className="grid gap-lg lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function PlayerFormSkeleton() {
  return (
    <div className="space-y-lg">
      <div className="grid gap-md md:grid-cols-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid gap-md md:grid-cols-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <div className="grid gap-md md:grid-cols-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}
