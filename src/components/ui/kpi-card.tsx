import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export type KpiVariant = 'teal' | 'blue' | 'purple' | 'amber' | 'danger'

const VARIANT_COLORS: Record<KpiVariant, { bg: string; text: string }> = {
  teal: { bg: 'bg-[#e1f5ee]', text: 'text-[#0f6e56]' },
  blue: { bg: 'bg-[#e6f1fb]', text: 'text-[#185fa5]' },
  purple: { bg: 'bg-[#eeedfe]', text: 'text-[#534ab7]' },
  amber: { bg: 'bg-[#faeeda]', text: 'text-[#854f0b]' },
  danger: { bg: 'bg-[#fcebeb]', text: 'text-[#a32d2d]' },
}

export interface KpiCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  variant?: KpiVariant
  trend?: {
    value: string | number
    isPositive?: boolean
    isNeutral?: boolean
  }
  className?: string
}

export function KpiCard({ label, value, icon, variant = 'teal', trend, className }: KpiCardProps) {
  const colors = VARIANT_COLORS[variant]

  return (
    <Card
      padding="md"
      hoverable
      className={cn('group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="mb-md flex items-start justify-between">
        <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors duration-300">
          {label}
        </span>
        {icon && (
          <div className={cn(
            'rounded-xl p-2 shadow-sm transition-all duration-300 group-hover:scale-110',
            colors.bg,
            colors.text
          )}>
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
              trend.isNeutral
                ? 'bg-surface-container-high/50 text-on-surface-variant'
                : trend.isPositive
                ? 'bg-success-container/20 text-success'
                : 'bg-error-container/20 text-error',
            )}
          >
            {trend.isNeutral ? (
              <Minus className="h-3 w-3" />
            ) : trend.isPositive ? (
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
