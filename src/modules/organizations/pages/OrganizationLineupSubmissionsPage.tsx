import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { useOrganizationMe, useOrganizationTournaments } from '../hooks'
import { Card, Button } from '@/components/ui'
import { competitionApi } from '@/modules/competitions/services/competition.api'
import type { LineupSubmission } from '@/modules/competitions/types/competition.types'
import { format } from 'date-fns'

export default function OrganizationLineupSubmissionsPage() {
  const { data: org } = useOrganizationMe()
  const slug = org?.slug
  const { data: competitions } = useOrganizationTournaments(slug)
  const [loading, setLoading] = useState(false)
  const [submissions, setSubmissions] = useState<Array<{ competitionId: string; competitionName: string; matchId: string; matchLabel: string; lineup: LineupSubmission }>>([])

  useEffect(() => {
    if (!competitions || (competitions as any).length === 0) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const results: typeof submissions = []
        for (const comp of competitions as any) {
          try {
            const matches = await competitionApi.listMatches(comp.id)
            for (const match of matches ?? []) {
              try {
                const lineups = await competitionApi.getLineups(match.id)
                if (Array.isArray(lineups)) {
                  for (const l of lineups) {
                    if (String(l.status).toLowerCase() === 'submitted') {
                      results.push({ competitionId: comp.id, competitionName: comp.name, matchId: match.id, matchLabel: `${match.home_club_name} vs ${match.away_club_name}`, lineup: l })
                    }
                  }
                }
              } catch (e) {
                // ignore per-match errors
              }
            }
          } catch (e) {
            // ignore per-competition errors
          }
        }
        if (mounted) setSubmissions(results)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [competitions])

  const accept = async (matchId: string, clubId: string) => {
    try {
      await competitionApi.confirmLineup(matchId, clubId)
      setSubmissions(prev => prev.filter(s => !(s.matchId === matchId && s.lineup.club === clubId)))
    } catch (e) {
      console.error('Failed to accept lineup', e)
      // Could show toast here
    }
  }

  return (
    <DashboardLayout title="Submissões de Escalações" subtitle="Gerir submissões pendentes" dashboardType="organization" sidebarLinks={[]}>
      <div className="mx-auto max-w-4xl px-lg py-xl">
        <div className="mb-lg flex items-center justify-between">
          <h2 className="text-xl font-semibold">Submissões pendentes</h2>
          <Button variant="secondary" size="sm" asChild>
            <Link to={ROUTES.DASHBOARD_ORGANIZATION}>Voltar</Link>
          </Button>
        </div>

        {loading && <div>Carregando submissões...</div>}

        {!loading && submissions.length === 0 && (
          <Card padding="lg" variant="flat">
            <div className="text-center text-sm text-on-surface-variant">Nenhuma submissão de escalação pendente encontrada para as suas competições.</div>
          </Card>
        )}

        <div className="space-y-sm">
          {submissions.map((s) => (
            <Card key={`${s.matchId}-${s.lineup.club}`} padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-on-surface-variant">{s.competitionName}</div>
                  <div className="font-medium">{s.matchLabel}</div>
                  <div className="text-sm text-on-surface-variant">Clube: {s.lineup.club_name || s.lineup.club}</div>
                  <div className="text-xs text-on-surface-variant">Submetida: {s.lineup.submitted_at ? format(new Date(s.lineup.submitted_at), 'Pp') : '—'}</div>
                </div>
                <div className="flex gap-sm">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={ROUTES.DASHBOARD_MATCH_LINEUP(s.competitionId, s.matchId)}>Ver</Link>
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => void accept(s.matchId, s.lineup.club)}>
                    Aceitar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
