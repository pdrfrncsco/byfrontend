import { useParams, Link } from 'react-router-dom'
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
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches, useCompetitionStandings, useGenerateSchedule } from '../hooks/useCompetitionPhase3'
import { useRegulations } from '../hooks/useCompetitionAdvanced'
import { useTopScorers } from '../hooks/useCompetitionAdvanced'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { CompetitionHeader, CompetitionHeaderSkeleton } from '../components/CompetitionHeader'
import { StandingsTable } from '../components/StandingsTable'
import { MatchCard } from '../components/MatchCard'
import { TopScorersTable } from '../components/TopScorersTable'
import { PlayerStatsTable } from '../components/PlayerStatsTable'
import { competitionRoutes } from '../routes'
import type { Match } from '../types'

// ─── Matches Tab ──────────────────────────────────────────────────────────────

interface MatchesTabProps {
  competitionId: string
  isAdmin: boolean
}

function MatchesTab({ competitionId, isAdmin }: MatchesTabProps) {
  const { data: matches = [], isLoading } = useCompetitionMatches(competitionId)
  const generateSchedule = useGenerateSchedule(competitionId)

  // Group by round
  const rounds = (matches as Match[]).reduce<Record<number, Match[]>>((acc, m) => {
    if (!acc[m.round_number]) acc[m.round_number] = []
    acc[m.round_number].push(m)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="flex flex-col gap-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    )
  }

  if (Object.keys(rounds).length === 0) {
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

      {Object.entries(rounds)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, roundMatches]) => (
          <div key={round} className="space-y-sm">
            <h3 className="flex items-center gap-sm text-sm font-semibold text-on-surface-variant">
              <span className="inline-flex items-center rounded-full bg-primary-container/30 px-md py-1 text-xs font-bold text-primary shadow-sm">
                Jornada {round}
              </span>
            </h3>
            <div className="space-y-sm">
              {roundMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  competitionId={competitionId}
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
  const { data: regulations = [], isLoading } = useRegulations(competitionId)

  if (isLoading) {
    return (
      <div className="space-y-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
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
  const { data: topScorers = [], isLoading: loadingScorers } = useTopScorers(competitionId)

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
  const competitionId = id ?? ''
  const { isAdmin } = useCompetitionAccess()

  const { data: competition, isLoading: loadingComp, isError: errorComp } = useCompetition(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)

  if (errorComp) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="font-medium text-on-surface">Competição não encontrada.</p>
        <Link to={competitionRoutes.list}>
          <Button variant="secondary" size="sm">Voltar às Competições</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      {/* Background Gradient Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/15 to-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-600/15 blur-3xl" />

      {/* Hero Header */}
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
      <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl relative z-10">
        <Tabs defaultValue="standings" className="space-y-lg">
          <TabsList className="p-1 bg-surface-container/70 rounded-full backdrop-blur">
            <TabsTrigger value="standings" id="comp-tab-standings" className="rounded-full">
              <Trophy className="mr-xs h-4 w-4" />
              Classificação
            </TabsTrigger>
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

          {/* Classificação */}
          <TabsContent value="standings" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingStandings ? (
              <div className="flex items-center justify-center py-xl">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <StandingsTable standings={standings} qualifyingSpots={3} />
            )}
          </TabsContent>

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
      </div>
    </div>
  )
}
