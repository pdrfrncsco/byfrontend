import React from 'react'
import { Badge } from '@/components/ui/badge'
import { getCategoryLabel } from '@/constants/categories'
import type { PlayerCategory } from '../types/player-category.types'

interface PlayerCategoryBadgeProps {
  category?: PlayerCategory | string | null
  size?: 'sm' | 'md'
  showAge?: boolean
  className?: string
}

function getCategoryColor(slug?: string): { bg: string; text: string; border: string } {
  const s = (slug || '').toLowerCase()
  if (s.includes('senior') || s.includes('sénior')) {
    return { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30' }
  }
  if (s.includes('junior') || s.includes('júnior') || s.includes('sub-23')) {
    return { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/30' }
  }
  if (s.includes('juvenil') || s.includes('sub-19')) {
    return { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-500/30' }
  }
  if (s.includes('iniciado') || s.includes('sub-17')) {
    return { bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-500/30' }
  }
  if (s.includes('infantil') || s.includes('sub-15')) {
    return { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30' }
  }
  if (s.includes('benjamim') || s.includes('sub-13')) {
    return { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/30' }
  }
  if (s.includes('traquina') || s.includes('petiz')) {
    return { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-500/30' }
  }
  if (s.includes('veteran')) {
    return { bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-500/30' }
  }
  return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' }
}

export const PlayerCategoryBadge: React.FC<PlayerCategoryBadgeProps> = ({
  category,
  size = 'sm',
  showAge = false,
  className = '',
}) => {
  if (!category) return null

  const isObj = typeof category === 'object'
  const name = isObj ? category.name : getCategoryLabel(category)
  const slug = isObj ? category.slug : category
  const isCustom = isObj ? category.is_custom : false
  const minAge = isObj ? category.min_age : null
  const maxAge = isObj ? category.max_age : null

  const color = getCategoryColor(slug)

  let ageText = ''
  if (showAge && minAge && maxAge) {
    ageText = ` (${minAge}-${maxAge}a)`
  } else if (showAge && minAge) {
    ageText = ` (+${minAge}a)`
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      title={
        isObj && (minAge || maxAge)
          ? `${name} • Faixa etária: ${minAge ?? '0'} a ${maxAge ?? '∞'} anos${isCustom ? ' (Personalizada do Clube)' : ''}`
          : name
      }
      className={`inline-flex items-center gap-1 rounded-md font-semibold border transition-colors shadow-2xs ${color.bg} ${color.text} ${color.border} ${sizeClasses} ${className}`}
    >
      <span>{name}</span>
      {ageText && <span className="opacity-75 font-normal">{ageText}</span>}
      {isCustom && (
        <span
          className="ml-0.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"
          title="Escalão personalizado do clube"
        />
      )}
    </span>
  )
}
