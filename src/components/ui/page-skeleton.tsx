import * as React from 'react'
import { Skeleton } from './skeleton'

interface PageSkeletonProps {
  variant?: 'card' | 'list' | 'detail'
}

export function PageSkeleton({ variant = 'card' }: PageSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-sm animate-pulse">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (variant === 'detail') {
    return (
      <div className="space-y-lg animate-pulse">
        <div className="flex gap-md">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-xs flex-1">
            <Skeleton className="h-6 w-1/3 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-lg animate-pulse">
      <div className="grid gap-md md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-[2rem]" />
    </div>
  )
}
