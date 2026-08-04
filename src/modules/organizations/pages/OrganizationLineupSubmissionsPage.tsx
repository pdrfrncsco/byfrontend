import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Button, Badge, Card, Textarea } from '@/components/ui'
import { useOnboardingStatus } from '../hooks'
import { organizationApi } from '../services/organization.api'
import type { LineupSubmission } from '@/modules/competitions/types/competition.types'
import { getOrganizationSidebarSections } from '../constants/navigation'

interface PendingLineupSubmission extends LineupSubmission {
  competition_id?: string
  competition_name?: string
  match_str?: string
}

export default function OrganizationLineupSubmissionsPage() {
  const { data: onboarding } = useOnboardingStatus()
  const showLineups = Boolean(onboarding?.is_organization_admin)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [submissions, setSubmissions] = useState<
    Array<{ competitionId: string; competitionName: string; matchId: string; matchLabel: string; lineup: LineupSubmission }>
  >([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await organizationApi.getPendingLineups()
        const results = Array.isArray(resp.results) ? resp.results : resp
        if (mounted) {
          setSubmissions(
            (results as PendingLineupSubmission[]).map((submission) => ({
              competitionId: submission.competition_id ?? '',
              competitionName: submission.competition_name ?? 'Competição',
              matchId: submission.match,
              matchLabel: submission.match_str ?? 'Jogo',
              lineup: submission,
            })),
          )
        }
      } catch (e) {
        setError('Não foi possível carregar as submissões de escalação.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const submitReview = async (submissionId: string, approve: boolean) => {
    const notes = reviewNotes[submissionId]?.trim() ?? ''
    setActionId(submissionId)
    try {
      const reviewed = await organizationApi.reviewPendingLineup(submissionId, {
        approve,
        review_notes: notes || undefined,
      })
      setSubmissions((prev) => prev.filter((submission) => submission.lineup.id !== reviewed.id))
      setReviewNotes((prev) => {
        const next = { ...prev }
        delete next[submissionId]
        return next
      })
      toast.success(approve ? 'Escalação aprovada.' : 'Escalação rejeitada.')
    } catch (e) {
      console.error('Failed to review lineup', e)
      toast.error('Não foi possível processar a revisão da escalação.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <DashboardLayout
      title="Submissões de Escalações"
      subtitle="Gerir submissões pendentes"
      dashboardType="organization"
      sidebarSections={getOrganizationSidebarSections('lineups', { showLineups })}
    >
      <div className="mx-auto max-w-4xl px-lg py-xl">
        <div className="mb-lg flex items-center justify-between">
          <h2 className="text-xl font-semibold">Submissões pendentes</h2>
          <Button variant="secondary" size="sm" asChild>
            <Link to={ROUTES.DASHBOARD_ORGANIZATION}>Voltar</Link>
          </Button>
        </div>

        {loading && <div>Carregando submissões...</div>}

        {!loading && error && (
          <Card padding="lg" variant="flat">
            <div className="text-sm text-error">{error}</div>
          </Card>
        )}

        {!loading && submissions.length === 0 && (
          <Card padding="lg" variant="flat">
            <div className="text-center text-sm text-on-surface-variant">Nenhuma submissão de escalação pendente encontrada para as suas competições.</div>
          </Card>
        )}

        <div className="space-y-sm">
          {submissions.map((s) => (
            <Card key={`${s.matchId}-${s.lineup.club}`} padding="lg">
              <div className="flex flex-col gap-md lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-sm">
                    <Badge variant="outline">{s.competitionName}</Badge>
                    <Badge variant="warning">Pendente</Badge>
                  </div>
                  <div className="text-lg font-semibold">{s.matchLabel}</div>
                  <div className="text-sm text-on-surface-variant">Clube: {s.lineup.club_name || s.lineup.club}</div>
                  <div className="text-xs text-on-surface-variant">
                    Submetida: {s.lineup.submitted_at ? format(new Date(s.lineup.submitted_at), 'Pp') : '—'}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Estado atual: {s.lineup.status_display || s.lineup.status}
                  </div>
                </div>

                <div className="flex gap-sm">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={ROUTES.DASHBOARD_MATCH_LINEUP(s.competitionId, s.matchId)}>Ver</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-md space-y-sm">
                <label className="text-sm font-medium text-on-surface">Notas de revisão</label>
                <Textarea
                  value={reviewNotes[s.lineup.id] ?? ''}
                  onChange={(event) =>
                    setReviewNotes((prev) => ({
                      ...prev,
                      [s.lineup.id]: event.target.value,
                    }))
                  }
                  placeholder="Adicione um comentário opcional para a aprovação ou rejeição."
                  rows={3}
                />
              </div>

              <div className="mt-md flex flex-wrap justify-end gap-sm">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void submitReview(s.lineup.id, false)}
                  disabled={actionId === s.lineup.id}
                >
                  {actionId === s.lineup.id ? 'Processando...' : 'Rejeitar'}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => void submitReview(s.lineup.id, true)}
                  disabled={actionId === s.lineup.id}
                >
                  {actionId === s.lineup.id ? 'Processando...' : 'Aprovar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
