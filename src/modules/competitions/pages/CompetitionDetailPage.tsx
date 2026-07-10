import { useParams, Link } from 'react-router-dom'
import {
  Trophy,
  BarChart3,
  Calendar,
  BookOpen,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button, Card } from '@/components/ui'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches, useCompetitionStandings, useGenerateSchedule } from '../hooks/useCompetitionPhase3'
import { useRegulations } from '../hooks/useCompetitionAdvanced'
import { useTopScorers } from '../hooks/useCompetitionAdvanced'
import { CompetitionHeader, CompetitionHeaderSkeleton } from '../components/CompetitionHeader'
import { StandingsTable } from '../components/StandingsTable'
import { MatchCard } from '../components/MatchCard'
import { TopScorersTable } from '../components/TopScorersTable'
import { PlayerStatsTable } from '../components/PlayerStatsTable'
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
              <span className="inline-flex items-center rounded-full bg-primary-container/20 px-sm py-0.5 text-xs font-bold text-primary">
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
        <Card key={reg.id} variant="flat" padding="lg">
          <div className="space-y-sm">
            <h3 className="font-semibold text-on-surface">{reg.title}</h3>
            {reg.category && (
              <span className="inline-block rounded-full bg-primary-container/20 px-sm py-0.5 text-xs text-primary">
                {reg.category}
              </span>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
              {reg.content}
            </p>
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

  const { data: competition, isLoading: loadingComp, isError: errorComp } = useCompetition(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)

  // TODO: derive isAdmin from auth context when available
  const isAdmin = false

  if (errorComp) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="font-medium text-on-surface">Competição não encontrada.</p>
        <Link to="/competitions">
          <Button variant="secondary" size="sm">Voltar às Competições</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      {loadingComp ? (
        <CompetitionHeaderSkeleton />
      ) : competition ? (
        <CompetitionHeader competition={competition} />
      ) : null}

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl">
        <Tabs defaultValue="standings" className="space-y-lg">
          <TabsList>
            <TabsTrigger value="standings" id="comp-tab-standings">
              <Trophy className="mr-xs h-4 w-4" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="matches" id="comp-tab-matches">
              <Calendar className="mr-xs h-4 w-4" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="stats" id="comp-tab-stats">
              <BarChart3 className="mr-xs h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="regulations" id="comp-tab-regulations">
              <BookOpen className="mr-xs h-4 w-4" />
              Regulamentos
            </TabsTrigger>
          </TabsList>

          {/* Classificação */}
          <TabsContent value="standings">
            {loadingStandings ? (
              <div className="flex items-center justify-center py-xl">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <StandingsTable standings={standings} qualifyingSpots={3} />
            )}
          </TabsContent>

          {/* Jogos */}
          <TabsContent value="matches">
            <MatchesTab competitionId={competitionId} isAdmin={isAdmin} />
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats">
            <StatsTab competitionId={competitionId} />
          </TabsContent>

          {/* Regulamentos */}
          <TabsContent value="regulations">
            <RegulationsTab competitionId={competitionId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
