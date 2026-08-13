import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const nativeSelectVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-lg border bg-surface-container text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-outline-variant/50 px-3 py-2',
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
  }
)

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof nativeSelectVariants> {}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, variant, state, children, ...props }, ref) => (
    <select
      className={cn(nativeSelectVariants({ variant, state }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect, nativeSelectVariants }
