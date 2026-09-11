import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ChevronRight, ArrowRight, Table } from 'lucide-react'
import { CompetitionCard } from '@/modules/competitions/components/CompetitionCard'
import type { Competition, Standing } from '@/modules/competitions/types'

export interface FeaturedCompetitionsSectionProps {
  competitions: Competition[]
  featuredCompetition?: Competition | null
  standings?: Standing[]
  isLoading?: boolean
  className?: string
}

function StandingClubLogo({ logo, name }: { logo?: string | null; name: string }) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.charAt(0)?.toUpperCase() || '?'

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        className="h-6 w-6 rounded-full object-cover shrink-0 border border-outline-variant/20 shadow-xs"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] font-bold shrink-0">
      {initial}
    </div>
  )
}

export function FeaturedCompetitionsSection({
  competitions = [],
  featuredCompetition,
  standings = [],
  isLoading = false,
  className = '',
}: FeaturedCompetitionsSectionProps) {
  const displayStandings = standings.slice(0, 5)
  const compId = featuredCompetition?.slug || featuredCompetition?.id || 'competitions'
  const compName = featuredCompetition?.name || 'Girabola 2025/26'

  if (isLoading) {
    return (
      <section className={`py-16 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${className}`}>
        <div className="h-6 w-48 bg-outline-variant/20 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-64 rounded-2xl bg-surface-container/60 border border-outline-variant/15 animate-pulse" />
          <div className="h-64 rounded-2xl bg-surface-container/60 border border-outline-variant/15 animate-pulse" />
          <div className="h-64 rounded-2xl bg-surface-container/60 border border-outline-variant/15 animate-pulse" />
        </div>
      </section>
    )
  }

  if (competitions.length === 0) {
    return null
  }

  return (
    <section className={`py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="h-3.5 w-3.5" />
            <span>Futebol em Competição</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Competições & Classificações Oficiais
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xl">
            Acompanhe o Girabola, Taça de Angola e torneios regionais com tabelas e calendários sincronizados.
          </p>
        </div>

        <Link
          to="/competitions"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
        >
          <span>Ver todas as competições</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Content Grid */}
      {displayStandings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Mini Standings Table */}
          <div className="lg:col-span-7 rounded-2xl border border-outline-variant/20 bg-surface-container p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm sm:text-base text-on-surface">
                  {compName} · Classificação
                </h3>
              </div>
              <Link
                to={`/competitions/${compId}`}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>Tabela Completa</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-on-surface-variant font-semibold uppercase tracking-wider border-b border-outline-variant/10 text-[10px]">
                    <th className="py-2 px-1 text-center w-8">#</th>
                    <th className="py-2 px-2">Clube</th>
                    <th className="py-2 px-2 text-center">J</th>
                    <th className="py-2 px-2 text-center">V</th>
                    <th className="py-2 px-2 text-center">E</th>
                    <th className="py-2 px-2 text-center">D</th>
                    <th className="py-2 px-2 text-center">SG</th>
                    <th className="py-2 px-2 text-center font-bold text-primary">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {displayStandings.map((team, idx) => {
                    const isFirst = idx === 0
                    return (
                      <tr
                        key={team.id || team.club}
                        className={`hover:bg-surface-container-high/60 transition-colors ${
                          isFirst ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-1 text-center font-bold text-on-surface-variant">
                          <span
                            className={`inline-flex items-center justify-center h-5 w-5 rounded-md ${
                              isFirst ? 'bg-primary text-on-primary-fixed text-[10px]' : ''
                            }`}
                          >
                            {team.position || idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2 max-w-[180px] sm:max-w-xs truncate">
                            <StandingClubLogo logo={team.club_logo} name={team.club_name} />
                            <span className="truncate font-medium text-on-surface">
                              {team.club_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center text-on-surface-variant">{team.played}</td>
                        <td className="py-2.5 px-2 text-center text-on-surface-variant">{team.won}</td>
                        <td className="py-2.5 px-2 text-center text-on-surface-variant">{team.drawn}</td>
                        <td className="py-2.5 px-2 text-center text-on-surface-variant">{team.lost}</td>
                        <td className="py-2.5 px-2 text-center text-on-surface-variant">
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </td>
                        <td className="py-2.5 px-2 text-center font-black text-primary font-mono text-sm">
                          {team.points}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Apuramento para Competições Africanas (CAF)</span>
              </span>
              <Link to={`/competitions/${compId}`} className="text-primary font-semibold hover:underline">
                Ver Jornadas
              </Link>
            </div>
          </div>

          {/* Right Competition Cards */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Outras Provas em Andamento
            </h3>
            <div className="space-y-3">
              {competitions.slice(0, 3).map(comp => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.slice(0, 6).map(comp => (
            <CompetitionCard key={comp.id} competition={comp} />
          ))}
        </div>
      )}
    </section>
  )
}
