import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Trophy,
  BarChart3,
  Calendar,
  BookOpen,
  Zap,
  Loader2,
  AlertCircle,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import {
  SportDetailLayout,
  SportEntityHeader,
  SportSidebar,
  SportSidebarCard,
  SportStatRow,
  SportTabs,
  SportTabsList,
  SportTabsTrigger,
  SportTabsContent,
} from '@/modules/shared/components/sport'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionConfig } from '../hooks/useCompetitionConfig'
import { useCompetitionRounds, useGenerateSchedule } from '../hooks/useCompetitionMatches'
import { useRegulations } from '../hooks/useCompetitionAdvanced'
import { useTopScorers } from '../hooks/useCompetitionAdvanced'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { CompetitionHeaderSkeleton } from '../components/CompetitionHeader'
import { CompetitionStandingsRouter } from '../components/CompetitionFormatRouter'
import { TournamentBracket } from '../components/formats/TournamentBracket'
import { MatchCard } from '../components/MatchCard'
import { TopScorersTable } from '../components/TopScorersTable'
import { PlayerStatsTable } from '../components/PlayerStatsTable'
import { competitionRoutes } from '../routes'
import { useSeo } from '@/hooks/useSeo'

// Helper function to detect UUID format
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function getErrorMessage(error: unknown) {
  return (error as { message?: string } | null)?.message ?? 'Verifique a ligação com a API.'
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Em Curso',
  completed: 'Concluída',
  archived: 'Arquivada',
}

const TYPE_LABELS: Record<string, string> = {
  league: 'Campeonato',
  tournament: 'Torneio',
  cup: 'Taça',
}

// ─── Matches Tab ──────────────────────────────────────────────────────────────

interface MatchesTabProps {
  competitionId: string
  isAdmin: boolean
}

function MatchesTab({ competitionId, isAdmin }: MatchesTabProps) {
  const { data: roundsView, isLoading, isError, error, refetch } = useCompetitionRounds(competitionId)
  const generateSchedule = useGenerateSchedule(competitionId)
  const rounds = roundsView?.rounds ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="font-medium text-on-surface">Erro ao carregar calendário de jogos.</p>
        <p className="text-sm opacity-70">{getErrorMessage(error)}</p>
        <div className="mt-md">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <Calendar className="h-12 w-12 opacity-30" />
        <p className="font-medium">Calendário ainda não gerado.</p>
        <p className="text-sm opacity-70">O administrador deve gerar o calendário de jogos.</p>
        {isAdmin && (
          <Button
            id="comp-generate-schedule-btn"
            variant="primary"
            size="sm"
            onClick={() => generateSchedule.mutate({ startDate: new Date().toISOString().split('T')[0] })}
            disabled={generateSchedule.isPending}
          >
            {generateSchedule.isPending ? (
              <Loader2 className="mr-xs h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-xs h-4 w-4" />
            )}
            Gerar Calendário
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            id="comp-regenerate-schedule-btn"
            variant="secondary"
            size="sm"
            onClick={() => generateSchedule.mutate({ startDate: new Date().toISOString().split('T')[0] })}
            disabled={generateSchedule.isPending}
          >
            {generateSchedule.isPending ? (
              <Loader2 className="mr-xs h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-xs h-4 w-4" />
            )}
            Regenerar Calendário
          </Button>
        </div>
      )}

      {rounds.map((round) => (
        <div key={round.id} className="space-y-sm">
          <h3 className="flex items-center gap-sm text-sm font-semibold text-on-surface-variant">
            <span className="inline-flex items-center rounded-full bg-primary-container/30 px-md py-1 text-xs font-bold text-primary shadow-sm">
              {round.label || `Ronda ${round.number}`}
            </span>
          </h3>
          <div className="space-y-sm">
            {round.matches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                competitionId={competitionId}
                showLink={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Regulations Tab ──────────────────────────────────────────────────────────

function RegulationsTab({ competitionId }: { competitionId: string }) {
  const { data: regulations = [], isLoading, isError, error, refetch } = useRegulations(competitionId)

  if (isLoading) {
    return (
      <div className="space-y-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="font-medium text-on-surface">Erro ao carregar regulamentos.</p>
        <p className="text-sm opacity-70">{getErrorMessage(error)}</p>
        <div className="mt-md">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (regulations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <BookOpen className="h-12 w-12 opacity-30" />
        <p className="font-medium">Nenhum regulamento publicado.</p>
        <p className="text-sm opacity-70">Os regulamentos serão exibidos aqui assim que forem disponibilizados pela organização.</p>
      </div>
    )
  }

  return (
    <div className="space-y-md">
      {regulations.map((reg) => (
        <Card key={reg.id} padding="lg" className="rounded-xl border border-outline-variant/30 bg-surface-container">
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-on-surface">{reg.title}</h3>
              {reg.version && (
                <span className="rounded-full bg-surface-container-highest px-sm py-xs text-xs font-medium text-on-surface-variant">
                  v{reg.version}
                </span>
              )}
            </div>
            {reg.summary && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                {reg.summary}
              </p>
            )}
            {reg.document && (
              <a
                href={reg.document}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-xs text-xs text-primary hover:underline"
              >
                Ver documento completo →
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab({ competitionId }: { competitionId: string }) {
  const { data: topScorers = [], isLoading: loadingScorers, isError, error, refetch } = useTopScorers(competitionId)

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="font-medium text-on-surface">Erro ao carregar estatísticas.</p>
        <p className="text-sm opacity-70">{getErrorMessage(error)}</p>
        <div className="mt-md">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      <section className="space-y-md">
        <h2 className="flex items-center gap-sm text-base font-semibold text-on-surface">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top Marcadores
        </h2>
        <TopScorersTable scorers={topScorers} isLoading={loadingScorers} limit={10} />
      </section>

      <section className="space-y-md">
        <h2 className="flex items-center gap-sm text-base font-semibold text-on-surface">
          <BarChart3 className="h-4 w-4 text-primary" />
          Estatísticas por Jogador
        </h2>
        <PlayerStatsTable competitionId={competitionId} />
      </section>
    </div>
  )
}

// ─── CompetitionDetailPage ─────────────────────────────────────────────────────

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const competitionId = id ?? ''
  const { isAdmin } = useCompetitionAccess()
  const { isTournament, isCup } = useCompetitionConfig(competitionId)

  const shouldFetchByUuid = isUUID(competitionId)
  
  const { data: competition, isLoading: loadingComp, isError: errorComp } = useCompetition(competitionId)
  useSeo({
    title: competition?.name ? `${competition.name} — Competição` : 'Detalhe da competição',
    description: competition?.name ? `Consulte classificação, jogos, estatísticas e regulamentos de ${competition.name}.` : 'Consulte os detalhes desta competição de futebol.',
    path: `/competitions/${competitionId}`,
  })

  useMemo(() => {
    if (shouldFetchByUuid && competition?.slug && competition.slug !== competitionId) {
      navigate(`/competitions/${competition.slug}`, { replace: true })
    }
  }, [shouldFetchByUuid, competition?.slug, competitionId, navigate])

  if (errorComp) {
    return (
      <SportDetailLayout
        breadcrumb={
          <div className="flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
            <span aria-hidden="true">/</span>
            <span className="text-on-surface">Detalhe</span>
          </div>
        }
        header={
          <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
            <AlertCircle className="h-12 w-12 text-error opacity-70" />
            <p className="font-medium text-on-surface">Competição não encontrada.</p>
            <Link to={competitionRoutes.list}><Button variant="secondary" size="sm">Voltar às Competições</Button></Link>
          </div>
        }
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  if (loadingComp || !competition) {
    return (
      <SportDetailLayout
        breadcrumb={
          <div className="flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
            <span aria-hidden="true">/</span>
            <span className="text-on-surface">A carregar...</span>
          </div>
        }
        header={<CompetitionHeaderSkeleton />}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  const typeLabel = TYPE_LABELS[competition.competition_type] ?? competition.competition_type
  const statusLabel = STATUS_LABELS[competition.status] ?? competition.status

  return (
    <SportDetailLayout
      breadcrumb={
        <div className="flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">{competition.name}</span>
        </div>
      }
      header={
        <SportEntityHeader
          visual={
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Trophy className="h-8 w-8" />
            </div>
          }
          title={competition.name}
          subtitle={`Temporada ${competition.season}. Explore a classificação, os jogos e estatísticas.`}
          chips={[
            { label: typeLabel },
            { label: statusLabel },
            { icon: Calendar, label: `Época ${competition.season}` },
          ]}
          actions={
            <div className="flex items-center gap-sm">
              <Button asChild variant="primary" size="sm">
                <Link to={competitionRoutes.matchCenterHub(competition.id)}>
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Match Center
                </Link>
              </Button>
            </div>
          }
        />
      }
      main={
        <SportTabs defaultValue="standings">
          <SportTabsList>
            <SportTabsTrigger value="standings" icon={Trophy}>
              {isCup ? 'Eliminatórias' : isTournament ? 'Grupos' : 'Classificação'}
            </SportTabsTrigger>
            {isTournament && (
              <SportTabsTrigger value="bracket" icon={Trophy}>
                Fase Final
              </SportTabsTrigger>
            )}
            <SportTabsTrigger value="matches" icon={Calendar}>
              Jogos
            </SportTabsTrigger>
            <SportTabsTrigger value="stats" icon={BarChart3}>
              Estatísticas
            </SportTabsTrigger>
            <SportTabsTrigger value="regulations" icon={BookOpen}>
              Regulamentos
            </SportTabsTrigger>
          </SportTabsList>

          <SportTabsContent value="standings">
            <CompetitionStandingsRouter competitionId={competitionId} />
          </SportTabsContent>

          {isTournament && (
            <SportTabsContent value="bracket">
              <TournamentBracket competitionId={competitionId} />
            </SportTabsContent>
          )}

          <SportTabsContent value="matches">
            <MatchesTab competitionId={competitionId} isAdmin={isAdmin} />
          </SportTabsContent>

          <SportTabsContent value="stats">
            <StatsTab competitionId={competitionId} />
          </SportTabsContent>

          <SportTabsContent value="regulations">
            <RegulationsTab competitionId={competitionId} />
          </SportTabsContent>
        </SportTabs>
      }
      sidebar={
        <SportSidebar>
          <SportSidebarCard title="Informação" icon={Trophy}>
            <SportStatRow label="Temporada" value={competition.season} />
            <SportStatRow label="Formato" value={typeLabel} />
            <SportStatRow label="Estado" value={statusLabel} />
          </SportSidebarCard>

          <SportSidebarCard title="Acesso Rápido" icon={Zap}>
            <div className="space-y-2">
              <Link
                to={competitionRoutes.matchCenterHub(competition.id)}
                className="flex items-center justify-between rounded-lg border border-outline-variant/15 bg-surface-container-low p-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>Centro de Jogos</span>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </Link>
              <Link
                to={competitionRoutes.rankings(competition.id)}
                className="flex items-center justify-between rounded-lg border border-outline-variant/15 bg-surface-container-low p-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>Classificação Geral</span>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </Link>
              <Link
                to={competitionRoutes.suspensions(competition.id)}
                className="flex items-center justify-between rounded-lg border border-outline-variant/15 bg-surface-container-low p-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>Suspensões & Disciplina</span>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </Link>
            </div>
          </SportSidebarCard>

          {isAdmin && (
            <SportSidebarCard title="Administração" icon={Settings}>
              <div className="space-y-2">
                <p className="text-xs text-on-surface-variant">
                  Tem permissões para gerir este torneio, inscrições e calendário.
                </p>
                <Button asChild variant="primary" size="sm" className="w-full">
                  <Link to={competitionRoutes.settings(competitionId)}>
                    Gerir Torneio
                  </Link>
                </Button>
              </div>
            </SportSidebarCard>
          )}
        </SportSidebar>
      }
    />
  )
}
