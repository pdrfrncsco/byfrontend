import { Link } from 'react-router-dom'
import { Trophy, Activity, Loader2, ChevronRight } from 'lucide-react'
import { useCompetitions } from '../hooks/useCompetitions'
import type { Competition } from '../types'

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  draft:     { color: '#94a3b8', bg: '#94a3b822', label: 'Rascunho' },
  active:    { color: '#10b981', bg: '#10b98122', label: 'Em Curso' },
  completed: { color: '#6b7280', bg: '#6b728022', label: 'Concluída' },
}

const TYPE_ICON: Record<string, React.ComponentType<any>> = {
  league:     Trophy,
  tournament: Activity,
  cup:        Trophy,
}

function CompetitionCard({ competition }: { competition: Competition }) {
  const statusCfg = STATUS_STYLE[competition.status] ?? STATUS_STYLE.draft
  const Icon = TYPE_ICON[competition.competition_type] ?? Trophy

  return (
    <Link
      to={`/competitions/${competition.id}`}
      id={`comp-card-${competition.id}`}
      className="comp-card"
    >
      <div className="comp-card__icon">
        <Icon size={22} />
      </div>
      <div className="comp-card__body">
        <div className="comp-card__name">{competition.name}</div>
        <div className="comp-card__meta">
          <span className="comp-card__season">{competition.season}</span>
          <span className="comp-card__type">{competition.type_label ?? competition.competition_type}</span>
        </div>
      </div>
      <div className="comp-card__right">
        <span
          className="comp-card__status"
          style={{ color: statusCfg.color, background: statusCfg.bg }}
        >
          {statusCfg.label}
        </span>
        <ChevronRight size={16} className="comp-card__arrow" />
      </div>
    </Link>
  )
}

export function CompetitionListPage() {
  const { data: competitions = [], isLoading, isError } = useCompetitions()

  return (
    <div className="comp-list-page">
      <div className="comp-list-page__header">
        <h1 className="comp-list-page__title">Competições</h1>
        <p className="comp-list-page__subtitle">
          Campeonatos, taças e torneios organizados na plataforma
        </p>
      </div>

      {isLoading && (
        <div className="comp-loading">
          <Loader2 size={28} className="spin" />
          <span>A carregar competições...</span>
        </div>
      )}

      {isError && (
        <div className="comp-error">
          <p>Ocorreu um erro ao carregar as competições.</p>
        </div>
      )}

      {!isLoading && !isError && competitions.length === 0 && (
        <div className="comp-empty">
          <Trophy size={40} />
          <p>Nenhuma competição disponível de momento.</p>
        </div>
      )}

      {!isLoading && competitions.length > 0 && (
        <div className="comp-list">
          {(competitions as Competition[]).map(c => (
            <CompetitionCard key={c.id} competition={c} />
          ))}
        </div>
      )}
    </div>
  )
}
