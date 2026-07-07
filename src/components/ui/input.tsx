import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full rounded-lg border bg-surface-container text-on-surface text-sm transition-all placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'border-outline-variant/50 px-md py-sm',
        search: 'border-outline-variant/50 py-sm pl-xl pr-md',
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

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, state, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ variant, state }), className)}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input, inputVariants }
