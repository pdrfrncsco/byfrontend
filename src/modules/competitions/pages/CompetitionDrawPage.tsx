import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, HelpCircle, Loader2, Sparkles, Check } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionConfig } from '../hooks/useCompetitionConfig'
import { useCompetitionStandings } from '../hooks/useCompetitionMatches'
import { useDraw } from '../hooks/useCompetitionAdvanced'
import { drawGroups, shuffle } from '../utils/draw-engine'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'

/**
 * CompetitionDrawPage — Sorteio de grupos (Torneio) e chaves (Taça).
 * Protected route — requires org admin role.
 */
export function CompetitionDrawPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const navigate = useNavigate()
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { isLeague, isTournament, isCup, tournamentConfig, cupConfig } = useCompetitionConfig(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  
  const drawMutation = useDraw(competitionId)

  const [previewGroups, setPreviewGroups] = useState<any[][]>([])
  const [previewBracket, setPreviewBracket] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [done, setDone] = useState(false)

  const handleSimulateDraw = () => {
    if (standings.length === 0) return
    setIsDrawing(true)
    setDone(false)

    setTimeout(() => {
      const clubs = standings.map((s) => ({
        id: s.club,
        name: s.club_name,
        logo: s.club_logo,
      }))

      if (isTournament && tournamentConfig) {
        const numGroups = tournamentConfig.groupStage.numberOfGroups || 2
        const drawn = drawGroups(clubs, numGroups)
        setPreviewGroups(drawn)
      } else if (isCup && cupConfig) {
        const shuffled = shuffle(clubs)
        setPreviewBracket(shuffled)
      }
      setIsDrawing(false)
      setDone(true)
    }, 1200) // Delay to simulate shuffling animation
  }

  const handleConfirmDraw = () => {
    drawMutation.mutate(undefined, {
      onSuccess: () => {
        navigate(competitionRoutes.schedule(competitionId))
      },
    })
  }

  if (loadingComp || loadingStandings) {
    return (
      <DashboardLayout
        title="Sorteio da Competição"
        subtitle="Gerir sorteio de equipas e emparelhamentos."
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
      title="Sorteio Oficial"
      subtitle={competition ? `${competition.name} — Realizar sorteio de chaves/grupos` : 'Sorteio de equipas.'}
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
      {isLeague ? (
        <Card variant="flat" padding="lg" className="text-center max-w-xl mx-auto space-y-md">
          <HelpCircle className="h-12 w-12 text-primary mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-on-surface">Não é necessário Sorteio</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Esta competição está configurada no formato de **Campeonato (Liga)**. 
            Neste formato, todos os clubes jogam entre si num único grupo e o calendário pode ser gerado diretamente.
          </p>
          <Button asChild variant="primary" className="mt-md">
            <Link to={competitionRoutes.schedule(competitionId)}>
              Ir para Calendário de Jogos
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-xl">
          {/* Main Info */}
          <Card variant="flat" padding="md">
            <CardHeader className="pb-sm">
              <CardTitle>Painel do Sorteio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Antes de gerar o calendário de partidas de um **{isCup ? 'Taça' : 'Torneio'}**, deve realizar o sorteio oficial 
                das equipas inscritas. Estão atualmente inscritos **{standings.length} clubes**.
              </p>

              {standings.length < 2 ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-md text-sm text-red-600 font-medium">
                  Precisa de pelo menos 2 clubes inscritos para realizar o sorteio.
                </div>
              ) : (
                <div className="flex gap-sm">
                  <Button
                    variant="primary"
                    onClick={handleSimulateDraw}
                    disabled={isDrawing || drawMutation.isPending}
                  >
                    {isDrawing ? (
                      <>
                        <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                        A baralhar potes...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-xs h-4 w-4" />
                        {done ? 'Refazer Sorteio de Teste' : 'Realizar Sorteio de Teste'}
                      </>
                    )}
                  </Button>

                  {done && (
                    <Button
                      variant="secondary"
                      onClick={handleConfirmDraw}
                      disabled={drawMutation.isPending}
                    >
                      {drawMutation.isPending ? (
                        <>
                          <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                          A gravar...
                        </>
                      ) : (
                        <>
                          <Check className="mr-xs h-4 w-4" />
                          Confirmar Sorteio Oficial
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shuffling preview */}
          {isDrawing && (
            <div className="flex flex-col items-center gap-md py-xl text-primary animate-pulse">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-sm font-semibold">A distribuir equipas aleatoriamente...</p>
            </div>
          )}

          {/* Sorteio results preview */}
          {done && !isDrawing && (
            <div className="space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-sm">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Simulação de Resultados
              </h3>

              {isTournament && previewGroups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {previewGroups.map((groupTeams, idx) => (
                    <Card key={idx} variant="flat" padding="none">
                      <CardHeader className="bg-primary/5 pb-xs">
                        <CardTitle className="text-sm font-bold text-primary">
                          Grupo {String.fromCharCode(65 + idx)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-sm">
                        <ul className="space-y-xs">
                          {groupTeams.map((t, tIdx) => (
                            <li key={t.id} className="flex items-center gap-sm p-xs hover:bg-surface-container/50 rounded-lg">
                              <span className="text-xs text-on-surface-variant w-4 font-semibold">{tIdx + 1}</span>
                              {t.logo ? (
                                <img src={t.logo} alt={t.name} className="h-6 w-6 rounded-full object-cover" />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-primary-container/20 text-[10px] font-bold text-primary flex items-center justify-center">
                                  {t.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-sm text-on-surface font-medium">{t.name}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {isCup && previewBracket.length > 0 && (
                <Card variant="flat" padding="none">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Chave de Eliminatórias (Emparelhamentos Simulados)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-md">
                    <div className="space-y-sm">
                      {Array.from({ length: Math.ceil(previewBracket.length / 2) }).map((_, idx) => {
                        const t1 = previewBracket[idx * 2]
                        const t2 = previewBracket[idx * 2 + 1]
                        return (
                          <div key={idx} className="flex items-center justify-between border border-outline-variant/10 rounded-xl bg-surface-container-low p-sm max-w-md">
                            <div className="flex items-center gap-sm">
                              {t1?.logo ? <img src={t1.logo} className="h-5 w-5 rounded-full object-cover" /> : null}
                              <span className="text-sm font-medium text-on-surface">{t1?.name || 'BYE'}</span>
                            </div>
                            <span className="text-xs text-on-surface-variant font-bold px-sm">VS</span>
                            <div className="flex items-center gap-sm">
                              <span className="text-sm font-medium text-on-surface">{t2?.name || 'BYE'}</span>
                              {t2?.logo ? <img src={t2.logo} className="h-5 w-5 rounded-full object-cover" /> : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
