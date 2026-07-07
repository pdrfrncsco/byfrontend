import { cn } from '@/lib/utils'

interface KpiCardProps {
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
    <div
      className={cn(
        "glass-card p-lg rounded-xl flex flex-col justify-between border border-outline-variant/30 relative overflow-hidden group",
        className
      )}
    >
      {/* Background glow hover effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-md">
        <span className="text-label-sm text-outline uppercase tracking-wider font-semibold">
          {label}
        </span>
        {icon && (
          <div className="p-sm rounded-lg bg-surface-container-high border border-outline-variant/20 text-primary group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto">
        <span className="font-headline-lg text-3xl text-on-surface group-hover:text-primary transition-colors duration-300">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-xs font-bold px-sm py-0.5 rounded",
              trend.isPositive
                ? "bg-primary-container/20 text-primary"
                : "bg-error-container/25 text-error"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
