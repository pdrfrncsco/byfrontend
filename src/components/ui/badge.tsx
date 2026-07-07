import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded px-sm py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-bright border border-outline-variant/30 text-on-surface-variant',
        primary: 'bg-primary-container/20 text-primary',
        secondary: 'bg-secondary-container/30 text-secondary',
        success: 'bg-primary-container/20 text-primary',
        warning: 'bg-tertiary-container/20 text-tertiary',
        danger: 'bg-error-container/25 text-error',
        outline: 'border border-outline-variant/40 text-on-surface-variant bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
