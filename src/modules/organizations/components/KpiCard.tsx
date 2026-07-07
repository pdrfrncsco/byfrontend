import { cn } from '@/lib/utils'
import { Card } from '@/components/ui'

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
      className={cn('group relative flex flex-col justify-between overflow-hidden', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="mb-md flex items-start justify-between">
        <span className="font-label-sm font-semibold uppercase tracking-wider text-outline">{label}</span>
        {icon && (
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-sm text-primary transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between">
        <span className="font-headline-lg text-3xl text-on-surface transition-colors duration-300 group-hover:text-primary">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'rounded px-sm py-0.5 text-xs font-bold',
              trend.isPositive ? 'bg-primary-container/20 text-primary' : 'bg-error-container/25 text-error',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  )
}
