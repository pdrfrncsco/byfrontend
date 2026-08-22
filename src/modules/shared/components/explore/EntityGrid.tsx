import type { ReactNode } from 'react'

interface EntityGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function EntityGrid({ children, columns = 2 }: EntityGridProps) {
  const columnClass = columns === 4 ? 'lg:grid-cols-4' : columns === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2'
  return <div className={`grid gap-lg ${columnClass}`}>{children}</div>
}
