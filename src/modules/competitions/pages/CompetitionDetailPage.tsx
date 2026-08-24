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
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button, Card } from '@/components/ui'
import { PublicDetailPageShell } from '@/modules/shared/components'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionConfig } from '../hooks/useCompetitionConfig'
import { useCompetitionRounds, useGenerateSchedule } from '../hooks/useCompetitionMatches'
import { useRegulations } from '../hooks/useCompetitionAdvanced'
import { useTopScorers } from '../hooks/useCompetitionAdvanced'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { CompetitionHeader, CompetitionHeaderSkeleton } from '../components/CompetitionHeader'
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
        <p className="font-medium">Sem regulamentos publicados.</p>
        <p className="text-sm opacity-70">Os regulamentos desta competição ainda não foram adicionados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-md">
      {regulations.map(reg => (
        <Card key={reg.id} variant="flat" padding="lg" className="border border-outline-variant/10 hover:shadow-md transition-shadow">
          <div className="space-y-sm">
            <div className="flex flex-wrap items-center gap-sm">
              <h3 className="font-semibold text-on-surface">{reg.title}</h3>
              {reg.version && (
                <span className="rounded-md bg-surface-container-high px-xs py-px text-xs text-on-surface-variant">
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

  // If UUID is detected in the URL, extract slug from the data and redirect
  const shouldFetchByUuid = isUUID(competitionId)
  
  const { data: competition, isLoading: loadingComp, isError: errorComp } = useCompetition(competitionId)
  useSeo({
    title: competition?.name ? `${competition.name} — Competição` : 'Detalhe da competição',
    description: competition?.name ? `Consulte classificação, jogos, estatísticas e regulamentos de ${competition.name}.` : 'Consulte os detalhes desta competição de futebol.',
    path: `/competitions/${competitionId}`,
  })

  // Redirect to slug if UUID was detected and competition data is loaded
  useMemo(() => {
    if (shouldFetchByUuid && competition?.slug && competition.slug !== competitionId) {
      navigate(`/competitions/${competition.slug}`, { replace: true })
    }
  }, [shouldFetchByUuid, competition?.slug, competitionId, navigate])


  if (errorComp) {
    return (
      <PublicDetailPageShell
        breadcrumb={
          <nav aria-label="Breadcrumb" className="mb-xl flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-on-surface">Detalhe</span>
          </nav>
        }
      >
        <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
          <AlertCircle className="h-12 w-12 text-error opacity-70" />
          <p className="font-medium text-on-surface">Competição não encontrada.</p>
          <Link to={competitionRoutes.list}><Button variant="secondary" size="sm">Voltar às Competições</Button></Link>
        </div>
      </PublicDetailPageShell>
    )
  }

  return (
    <PublicDetailPageShell
      breadcrumb={
        <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate text-on-surface">{loadingComp ? 'A carregar...' : competition?.name ?? 'Detalhe'}</span>
        </nav>
      }
    >
      {loadingComp ? (
        <CompetitionHeaderSkeleton />
      ) : competition ? (
        <CompetitionHeader competition={competition} />
      ) : null}

      {/* Admin Notice Bar */}
      {isAdmin && (
        <div className="mx-auto max-w-6xl px-md pt-md sm:px-xl relative z-10">
          <div className="flex items-center justify-between gap-md rounded-xl border border-primary/20 bg-primary-container/10 p-md shadow-md">
            <div className="flex items-center gap-sm">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-on-surface">Administrador da Competição</p>
                <p className="text-xs text-on-surface-variant">Tem permissões administrativas para gerir este torneio, inscrições e calendário.</p>
              </div>
            </div>
            <Button variant="primary" size="sm" asChild>
              <Link to={competitionRoutes.settings(competitionId)}>
                Gerir Torneio
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main aria-label="Conteúdo da competição" className="mx-auto max-w-6xl px-md py-xl sm:px-xl relative z-10">
        <Tabs defaultValue="standings" className="space-y-lg">
          <TabsList className="p-1 bg-surface-container rounded-full backdrop-blur flex-wrap h-auto gap-xs">
            <TabsTrigger value="standings" id="comp-tab-standings" className="rounded-full">
              <Trophy className="mr-xs h-4 w-4" />
              {isCup ? 'Eliminatórias' : isTournament ? 'Grupos' : 'Classificação'}
            </TabsTrigger>
            {isTournament && (
              <TabsTrigger value="bracket" id="comp-tab-bracket" className="rounded-full">
                <Trophy className="mr-xs h-4 w-4" />
                Fase Final
              </TabsTrigger>
            )}
            <TabsTrigger value="matches" id="comp-tab-matches" className="rounded-full">
              <Calendar className="mr-xs h-4 w-4" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="stats" id="comp-tab-stats" className="rounded-full">
              <BarChart3 className="mr-xs h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="regulations" id="comp-tab-regulations" className="rounded-full">
              <BookOpen className="mr-xs h-4 w-4" />
              Regulamentos
            </TabsTrigger>
          </TabsList>

          {/* Classificação / Grupos / Eliminatórias */}
          <TabsContent value="standings" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CompetitionStandingsRouter competitionId={competitionId} />
          </TabsContent>

          {/* Bracket - Tournament Knockout */}
          {isTournament && (
            <TabsContent value="bracket" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <TournamentBracket competitionId={competitionId} />
            </TabsContent>
          )}

          {/* Jogos */}
          <TabsContent value="matches" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MatchesTab competitionId={competitionId} isAdmin={isAdmin} />
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StatsTab competitionId={competitionId} />
          </TabsContent>

          {/* Regulamentos */}
          <TabsContent value="regulations" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RegulationsTab competitionId={competitionId} />
          </TabsContent>
        </Tabs>
      </main>
    </PublicDetailPageShell>
  )
}
