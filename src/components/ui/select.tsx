import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const selectVariants = cva(
  'w-full appearance-none rounded-lg border bg-surface-container text-on-surface text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'border-outline-variant/50 px-md py-sm pr-xl',
        filter: 'border-outline-variant/50 py-sm pl-xl pr-lg',
      },
      state: {
        default: '',
        error: 'border-error/50 focus:ring-error',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'default',
    },
  },
)

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, state, children, ...props }, ref) => (
    <select ref={ref} className={cn(selectVariants({ variant, state }), className)} {...props}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export { Select, selectVariants }
