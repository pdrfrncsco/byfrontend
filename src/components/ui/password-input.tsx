import * as React from 'react'
import { useState } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  showStrengthMeter?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, showStrengthMeter = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [internalValue, setInternalValue] = useState('')

    const currentValue = (value !== undefined ? String(value) : internalValue) || ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value)
      }
      onChange?.(e)
    }

    // Rules
    const hasMinLength = currentValue.length >= 8
    const hasUpper = /[A-Z]/.test(currentValue)
    const hasNumber = /[0-9]/.test(currentValue)
    const hasSpecial = /[^A-Za-z0-9]/.test(currentValue)

    const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

    const strengthLabel = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Forte'][strengthScore]
    const strengthColor = [
      '',
      'bg-error text-error',
      'bg-error text-error',
      'bg-amber-500 text-amber-500',
      'bg-primary text-primary',
    ][strengthScore]

    return (
      <div className="w-full space-y-1.5">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            className={cn(
              'w-full px-md py-sm pr-10 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm',
              error && 'border-error focus:border-error',
              className,
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && <p className="text-xs text-error mt-1">{error}</p>}

        {showStrengthMeter && currentValue.length > 0 && (
          <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
            {/* Strength Bar */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    step <= strengthScore
                      ? strengthScore >= 4
                        ? 'bg-primary'
                        : strengthScore === 3
                          ? 'bg-amber-500'
                          : 'bg-error'
                      : 'bg-outline-variant/40',
                  )}
                />
              ))}
              <span className={cn('text-[11px] font-semibold ml-1.5', strengthColor)}>
                {strengthLabel}
              </span>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-on-surface-variant pt-0.5">
              <div className="flex items-center gap-1">
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-outline shrink-0" />
                )}
                <span className={hasMinLength ? 'text-on-surface font-medium' : ''}>
                  Mínimo 8 caracteres
                </span>
              </div>
              <div className="flex items-center gap-1">
                {hasUpper ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-outline shrink-0" />
                )}
                <span className={hasUpper ? 'text-on-surface font-medium' : ''}>
                  Letra maiúscula
                </span>
              </div>
              <div className="flex items-center gap-1">
                {hasNumber ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-outline shrink-0" />
                )}
                <span className={hasNumber ? 'text-on-surface font-medium' : ''}>
                  Pelo menos um número
                </span>
              </div>
              <div className="flex items-center gap-1">
                {hasSpecial ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-outline shrink-0" />
                )}
                <span className={hasSpecial ? 'text-on-surface font-medium' : ''}>
                  Carácter especial (@#$%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
