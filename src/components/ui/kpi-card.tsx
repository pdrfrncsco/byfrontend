import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface KpiCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string | number
    isPositive?: boolean
  }
  className?: string
}

export function KpiCard({ label, value, icon, trend, className }: KpiCardProps) {
  return (
    <Card
      padding="md"
      hoverable
      className={cn('group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="mb-md flex items-start justify-between">
        <span className="font-label-sm font-medium uppercase tracking-wider text-on-surface-variant group-hover:text-primary transition-colors duration-300">
          {label}
        </span>
        {icon && (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-high p-2 text-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-sm">
        <span className="font-display-lg text-3xl font-bold tracking-tight text-on-surface transition-colors duration-300 group-hover:text-primary">
          {value}
        </span>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-xs rounded-full px-2 py-0.5 text-[10px] font-bold transition-all duration-300',
              trend.isPositive
                ? 'bg-success-container/20 text-success'
                : 'bg-error-container/20 text-error',
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
