import { useParams, Link } from 'react-router-dom'
import { Users, Loader2, Shield } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useCompetitionStandings, useRegisterClub } from '../hooks/useCompetitionPhase3'
import { useCompetition } from '../hooks/useCompetitions'
import { CompetitionHeaderSkeleton } from '../components/CompetitionHeader'
import { CompetitionManagementFrame } from '../components/CompetitionManagementFrame'
import type { Standing } from '../types'

/**
 * CompetitionRegistrationPage — manage clubs registered in a competition.
 * Shows registered clubs and allows admins to add/remove clubs.
 * Protected route — requires org admin role.
 */
export function CompetitionRegistrationPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  const registerClub = useRegisterClub(competitionId)

  if (loadingComp) return <CompetitionHeaderSkeleton />

  return (
    <CompetitionManagementFrame
      backTo={`/competitions/${competitionId}`}
      backLabel="Voltar à Competição"
      badge={<><Users className="h-3.5 w-3.5" /> Inscrição de Clubes</>}
      title="Clubes Inscritos"
      description={competition ? `${competition.name} — ${competition.season}` : undefined}
      contentClassName="mx-auto max-w-5xl"
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
          <h3 className="font-semibold text-on-surface">Adicionar Clube</h3>
          <p className="text-sm text-on-surface-variant">
            Para inscrever um clube, utilize o ID do clube na plataforma.
            Esta funcionalidade será expandida com pesquisa autocomplete em breve.
          </p>
          <div className="flex gap-sm">
            <input
              id="club-id-input"
              type="text"
              placeholder="ID do clube (UUID)"
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={registerClub.isPending}
              onClick={() => {
                const input = document.getElementById('club-id-input') as HTMLInputElement
                if (input?.value) {
                  registerClub.mutate(input.value)
                  input.value = ''
                }
              }}
              id="register-club-btn"
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
    </CompetitionManagementFrame>
  )
}
