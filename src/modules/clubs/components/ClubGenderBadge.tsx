import React from 'react'

interface ClubGenderBadgeProps {
  gender?: 'male' | 'female' | 'mixed' | string | null
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export const ClubGenderBadge: React.FC<ClubGenderBadgeProps> = ({
  gender = 'mixed',
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const g = (gender || 'mixed').toLowerCase()

  let label = 'Misto'
  let icon = '⚥'
  let colors = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'

  if (g === 'male' || g === 'masculino') {
    label = 'Masculino'
    icon = '♂'
    colors = 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20'
  } else if (g === 'female' || g === 'feminino') {
    label = 'Feminino'
    icon = '♀'
    colors = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colors} ${sizeClasses} ${className}`}
      title={`Departamento / Género: ${label}`}
    >
      {showIcon && <span className="font-bold text-xs">{icon}</span>}
      <span>{label}</span>
    </span>
  )
}
