import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-xs', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs font-semibold text-error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-[10px] text-outline">{hint}</p>}
    </div>
  )
}
