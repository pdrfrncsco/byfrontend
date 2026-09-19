import React, { useMemo } from 'react'
import { useClubCategories } from '../hooks/usePlayerCategories'
import { getCategoryByAge } from '@/constants/categories'
import type { PlayerCategory } from '../types/player-category.types'

interface PlayerCategorySelectProps {
  clubIdOrSlug?: string
  value?: string
  onChange: (value: string) => void
  playerAge?: number | null
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export const PlayerCategorySelect: React.FC<PlayerCategorySelectProps> = ({
  clubIdOrSlug = 'me',
  value,
  onChange,
  playerAge,
  label = 'Categoria / Escalão',
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const { data: categories = [], isLoading } = useClubCategories(clubIdOrSlug)

  const recommendedCatSlug = useMemo(() => {
    if (playerAge === undefined || playerAge === null) return undefined
    const rec = getCategoryByAge(playerAge)
    return rec?.slug
  }, [playerAge])

  // Split between Federation and Custom club categories
  const { federationCategories, clubCategories } = useMemo(() => {
    const fed: PlayerCategory[] = []
    const custom: PlayerCategory[] = []
    categories.forEach((cat) => {
      if (cat.is_custom || cat.scope === 'club') {
        custom.push(cat)
      } else {
        fed.push(cat)
      }
    })
    return { federationCategories: fed, clubCategories: custom }
  }, [categories])

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === value || c.slug === value)
  }, [categories, value])

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-on-surface">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className={`w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-xs font-medium text-on-surface shadow-2xs transition-colors focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-50 ${
            error ? 'border-error' : ''
          }`}
        >
          <option value="">
            {isLoading ? 'A carregar categorias...' : 'Selecione um escalão...'}
          </option>

          {federationCategories.length > 0 && (
            <optgroup label="Categorias Oficiais (Federação)">
              {federationCategories.map((cat) => {
                const isRec = cat.slug === recommendedCatSlug
                const ageLabel =
                  cat.min_age && cat.max_age
                    ? ` (${cat.min_age}–${cat.max_age} anos)`
                    : cat.min_age
                    ? ` (+${cat.min_age} anos)`
                    : ''
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                    {ageLabel}
                    {isRec ? ' ★ Recomendado' : ''}
                  </option>
                )
              })}
            </optgroup>
          )}

          {clubCategories.length > 0 && (
            <optgroup label="Categorias do Clube (Personalizadas)">
              {clubCategories.map((cat) => {
                const ageLabel =
                  cat.min_age && cat.max_age
                    ? ` (${cat.min_age}–${cat.max_age} anos)`
                    : ''
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                    {ageLabel} (Clube)
                  </option>
                )
              })}
            </optgroup>
          )}
        </select>
      </div>

      {selectedCategory && (
        <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
          <span>Faixa regulamentar:</span>
          <span className="font-semibold text-primary">
            {selectedCategory.min_age && selectedCategory.max_age
              ? `${selectedCategory.min_age} a ${selectedCategory.max_age} anos`
              : selectedCategory.min_age
              ? `Superior a ${selectedCategory.min_age} anos`
              : 'Sem limite etário'}
          </span>
          {selectedCategory.gender && selectedCategory.gender !== 'mixed' && (
            <span className="capitalize">({selectedCategory.gender})</span>
          )}
        </p>
      )}

      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  )
}
