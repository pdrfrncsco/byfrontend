import { useParams, Link } from 'react-router-dom'
import { Users, Loader2, Shield } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField } from '@/components/ui'
import { useCompetitionStandings, useRegisterClub } from '../hooks/useCompetitionPhase3'
import { useCompetition } from '../hooks/useCompetitions'
import { useOrganizationMe, useOrganizationClubs } from '@/modules/organizations/hooks'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import type { Standing } from '../types'

/**
 * CompetitionRegistrationPage — manage clubs registered in a competition.
 * Shows registered clubs and allows admins to add/remove clubs.
 * Protected route — requires org admin role.
 */
export function CompetitionRegistrationPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  const registerClub = useRegisterClub(competitionId)

  const { data: org } = useOrganizationMe()
  const { data: orgClubs, isLoading: loadingOrgClubs } = useOrganizationClubs(org?.slug)

  if (loadingComp) {
    return (
      <DashboardLayout
        title="Inscrição de Clubes"
        subtitle="Gerir os clubes participantes desta competição."
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        <Card variant="flat" padding="lg" className="space-y-sm">
          <div className="h-5 w-48 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-24 rounded-xl bg-surface-container-high animate-pulse" />
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Inscrição de Clubes"
      subtitle={competition ? `${competition.name} — ${competition.season}` : 'Gerir os clubes participantes desta competição.'}
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={competitionRoutes.detail(competitionId)}>
            <Users className="h-4 w-4" />
            <span>Ver página pública</span>
          </Link>
        </Button>
      }
    >
      <Card variant="flat" padding="none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-sm">
              <Shield className="h-4 w-4 text-primary" />
              Equipas Participantes
              {!loadingStandings && (
                <span className="ml-xs rounded-full bg-primary-container/20 px-sm py-0.5 text-xs font-bold text-primary">
                  {standings.length}
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStandings ? (
            <div className="flex items-center gap-sm py-md text-sm text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" />
              A carregar clubes...
            </div>
          ) : standings.length === 0 ? (
            <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
              <Users className="h-10 w-10 opacity-30" />
              <p className="font-medium">Nenhum clube inscrito.</p>
              <p className="text-sm opacity-70">
                Os clubes participantes ainda não foram adicionados a esta competição.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/10">
              {(standings as Standing[]).map(s => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-md py-sm"
                >
                  <div className="flex items-center gap-sm">
                    {s.club_logo ? (
                      <img
                        src={s.club_logo}
                        alt={s.club_name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                        {s.club_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/clubs/${s.club}`}
                        className="text-sm font-medium text-on-surface transition-colors hover:text-primary"
                      >
                        {s.club_name}
                      </Link>
                      <p className="text-xs text-on-surface-variant">
                        {s.played} jogo{s.played !== 1 ? 's' : ''} — {s.points} pt{s.points !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-container-high px-sm py-0.5 text-xs font-semibold text-on-surface-variant">
                    #{s.position}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card variant="flat" padding="lg">
        <div className="space-y-md">
          <h3 className="font-semibold text-on-surface">Inscrever Clube da Organização</h3>
          <p className="text-sm text-on-surface-variant">
            Selecione um dos clubes filiados à sua organização para inscrever nesta competição.
          </p>
          <div className="flex gap-sm items-end">
            <FormField label="Clube Filiado" htmlFor="club-id-select" className="flex-1">
              {loadingOrgClubs ? (
                <div className="text-xs text-on-surface-variant flex items-center gap-xs h-10 px-md py-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> A carregar clubes afiliados...
                </div>
              ) : (
                <select
                  id="club-id-select"
                  className="w-full rounded-lg border border-outline-variant bg-[#0b1c30] px-md py-xs text-sm text-on-surface focus:border-primary focus:outline-none h-10"
                >
                  <option value="">Selecione um clube...</option>
                  {Array.isArray(orgClubs) &&
                    orgClubs
                      .filter((c: any) => !standings.some((s: any) => s.club === c.id))
                      .map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city || 'Sem Cidade'})
                        </option>
                      ))}
                </select>
              )}
            </FormField>
            <Button
              variant="primary"
              size="sm"
              disabled={registerClub.isPending}
              onClick={() => {
                const select = document.getElementById('club-id-select') as HTMLSelectElement
                if (select?.value) {
                  registerClub.mutate(select.value)
                  select.value = ''
                }
              }}
              id="register-club-btn"
              className="h-10 animate-fade-in"
            >
              {registerClub.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Inscrever'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  )
}
