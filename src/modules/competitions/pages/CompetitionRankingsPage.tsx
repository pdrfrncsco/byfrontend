import { useParams, Link } from 'react-router-dom'
import { Trophy, Shield, Target } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useCompetition } from '../hooks/useCompetitions'
import { useTopScorers, useFairPlayRanking } from '../hooks/useCompetitionAdvanced'
import { TopScorersTable } from '../components/TopScorersTable'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import type { FairPlayRanking } from '../types'

// ─── Fair Play Table ─────────────────────────────────────────────────────────

function FairPlayTable({
  rankings,
  isLoading,
}: {
  rankings: FairPlayRanking[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    )
  }

  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
        <Shield className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">Sem dados de Fair Play.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-high">
            <th className="w-10 px-md py-sm text-center font-semibold text-on-surface-variant">#</th>
            <th className="px-md py-sm text-left font-semibold text-on-surface-variant">Clube</th>
            <th className="w-16 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Cartões Amarelos">CA</th>
            <th className="w-16 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Cartões Vermelhos">CV</th>
            <th className="w-20 px-sm py-sm text-center font-bold text-on-surface" title="Pontos">Pts</th>
            <th className="w-24 px-sm py-sm text-center font-bold text-on-surface" title="Índice Fair Play">Índice</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, idx) => (
            <tr
              key={r.id}
              className="border-b border-outline-variant/10 transition-colors last:border-0 hover:bg-surface-container-high/50"
            >
              <td className="px-md py-sm text-center font-semibold text-on-surface-variant">
                {idx + 1}
              </td>
              <td className="px-md py-sm">
                <div className="flex items-center gap-sm">
                  {r.club_logo ? (
                    <img src={r.club_logo} alt={r.club_name} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                      {r.club_name.charAt(0)}
                    </div>
                  )}
                  <Link
                    to={`/clubs/${r.club}`}
                    className="font-medium text-on-surface transition-colors hover:text-primary"
                  >
                    {r.club_name}
                  </Link>
                </div>
              </td>
              <td className="px-sm py-sm text-center font-medium text-amber-600">{r.yellow_cards}</td>
              <td className="px-sm py-sm text-center font-medium text-red-500">{r.red_cards}</td>
              <td className="px-sm py-sm text-center">
                <span className="rounded-lg bg-primary/10 px-sm py-xs text-sm font-bold text-primary">
                  {r.points}
                </span>
              </td>
              <td className="px-sm py-sm text-center">
                <span
                  className={`rounded-lg px-sm py-xs text-sm font-bold ${
                    r.fair_play_score >= 80
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : r.fair_play_score >= 50
                        ? 'bg-amber-500/10 text-amber-700'
                        : 'bg-red-500/10 text-red-700'
                  }`}
                >
                  {r.fair_play_score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── CompetitionRankingsPage ──────────────────────────────────────────────────

/**
 * CompetitionRankingsPage — shows top scorers, fair play ranking, and season stats.
 */
export function CompetitionRankingsPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: topScorers = [], isLoading: loadingScorers } = useTopScorers(competitionId)
  const { data: fairPlay = [], isLoading: loadingFairPlay } = useFairPlayRanking(competitionId)

  return (
    <DashboardLayout
      title="Rankings & Fair Play"
      subtitle={!loadingComp && competition ? `${competition.name} — ${competition.season}` : 'Consultar marcadores e fair play da competição.'}
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={competitionRoutes.detail(competitionId)}>
            <Trophy className="h-4 w-4" />
            <span>Ver página pública</span>
          </Link>
        </Button>
      }
    >
      <Tabs defaultValue="scorers" className="space-y-lg">
        <TabsList>
          <TabsTrigger value="scorers" id="rankings-tab-scorers">
            <Target className="mr-xs h-4 w-4" />
            Marcadores
          </TabsTrigger>
          <TabsTrigger value="fair-play" id="rankings-tab-fairplay">
            <Shield className="mr-xs h-4 w-4" />
            Fair Play
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scorers">
          <TopScorersTable scorers={topScorers} isLoading={loadingScorers} limit={20} />
        </TabsContent>

        <TabsContent value="fair-play">
          <FairPlayTable rankings={fairPlay} isLoading={loadingFairPlay} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
