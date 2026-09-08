import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/app/providers'
import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  className?: string
  variant?: 'ghost' | 'outline' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export function ThemeToggle({
  className = '',
  variant = 'ghost',
  size = 'icon',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`relative rounded-full transition-transform active:scale-95 ${className}`}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 transition-all duration-300 rotate-0 scale-100 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200 transition-all duration-300 rotate-0 scale-100 hover:-rotate-12" />
      )}
      <span className="sr-only">
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </span>
    </Button>
  )
}
