import { Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import { ClubCardCompact } from '@/modules/clubs/components/ClubCardCompact'
import type { Club } from '@/modules/clubs/types'

export interface ClubsShowcaseProps {
  clubs: Club[]
  totalClubs?: number
  isLoading?: boolean
  className?: string
}

export function ClubsShowcase({
  clubs = [],
  totalClubs,
  isLoading = false,
  className = '',
}: ClubsShowcaseProps) {
  if (isLoading) {
    return (
      <section className={`py-16 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${className}`}>
        <div className="h-6 w-48 bg-outline-variant/20 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-container/60 border border-outline-variant/15 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (clubs.length === 0) {
    return null
  }

  return (
    <section className={`py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Comunidade Desportiva</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Clubes & Academias Registadas
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xl">
            Conheça os plantéis oficiais, equipas técnicas e a identidade pública dos clubes no ecossistema BolaYetu.
          </p>
        </div>

        <Link
          to="/clubs"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
        >
          <span>Ver todos os clubes {totalClubs ? `(${totalClubs})` : ''}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Clubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.slice(0, 6).map(club => (
          <ClubCardCompact key={club.id || club.slug} club={club} />
        ))}
      </div>
    </section>
  )
}
