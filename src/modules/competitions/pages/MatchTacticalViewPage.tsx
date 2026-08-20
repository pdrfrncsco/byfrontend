import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, RefreshCw, AlertCircle, Users } from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import { useLineups } from '../hooks/useLineups'
import { useTacticalPositions } from '../hooks/useTacticalPositions'
import TacticalField, { TacticalPlayer } from '../components/tactical/TacticalField'
import { generateTacticalPositions } from '../utils/tactical.utils'
import type { Match, LineupSubmission, LineupPlayer } from '../types'
import { toast } from 'sonner'

export default function MatchTacticalViewPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''

  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  // Fetch match details and lineups
  const { isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(matchIdValue)

  const match = (matches as Match[]).find((m) => m.id === matchIdValue)
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  // Find home and away lineups
  const homeLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.home_club)
  const awayLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.away_club)

  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home')
  const [players, setPlayers] = useState<TacticalPlayer[]>([])

  const currentClubId = activeTeam === 'home' ? match?.home_club : match?.away_club
  const { loadPositions, savePositions, loading: savingPositions } = useTacticalPositions(
    matchIdValue,
    currentClubId
  )

  // Extract starters for the current active team
  const getStartersForTeam = useCallback(
    (team: 'home' | 'away'): { starters: LineupPlayer[]; formation: string } => {
      const lineup = team === 'home' ? homeLineup : awayLineup
      if (!lineup) return { starters: [], formation: '4-3-3' }

      const starters =
        lineup.starters ??
        lineup.lineup_players?.filter((p) => String(p.status).toLowerCase() === 'starter') ??
        []

      return {
        starters,
        formation: lineup.formation || '4-3-3',
      }
    },
    [homeLineup, awayLineup]
  )

  // Load tactical positions or fallback to generating from real lineup
  const loadTacticalData = useCallback(async () => {
    if (!match) return

    // 1. Try to load custom saved positions for this team
    const customPositions = await loadPositions()
    if (customPositions && customPositions.length > 0) {
      setPlayers(customPositions)
      return
    }

    // 2. Generate positions from real submitted lineup
    const { starters, formation } = getStartersForTeam(activeTeam)
    if (starters.length > 0) {
      const generated = generateTacticalPositions(starters, formation, activeTeam === 'home')
      setPlayers(generated)
    } else {
      setPlayers([])
    }
  }, [match, loadPositions, getStartersForTeam, activeTeam])

  useEffect(() => {
    loadTacticalData()
  }, [loadTacticalData])

  const onPositionsChange = useCallback((next: TacticalPlayer[]) => {
    setPlayers(next)
  }, [])

  const handleSave = async () => {
    if (!currentClubId) return
    const res = await savePositions(players)
    if (res?.conflict) {
      const message =
        'Existe uma versão mais recente no servidor. Sobrescrever alterações ou carregar do servidor?'
      if (window.confirm(message)) {
        await savePositions(players, { force: true })
      } else {
        await loadTacticalData()
        toast.info('Versão do servidor recarregada.')
      }
    }
  }

  const handleReset = () => {
    const { starters, formation } = getStartersForTeam(activeTeam)
    if (starters.length > 0) {
      const generated = generateTacticalPositions(starters, formation, activeTeam === 'home')
      setPlayers(generated)
      toast.info('Posições reiniciadas para a formação padrão.')
    }
  }

  // Loading state
  if (loadingComp || loadingMatches || loadingLineups) {
    const LoadingState = () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Vista Tática"
          subtitle="A carregar..."
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <LoadingState />
        </DashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState />
      </div>
    )
  }

  // Match not found guard
  if (!match) {
    const NotFound = () => (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-md">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="text-lg font-medium text-on-surface">Jogo não encontrado</p>
        <Link
          to={
            isDashboard
              ? competitionRoutes.adminMatchDetail(competitionId, matchIdValue)
              : competitionRoutes.matchDetail(competitionId, matchIdValue)
          }
        >
          <Button variant="secondary" size="sm">
            Voltar ao jogo
          </Button>
        </Link>
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Jogo não encontrado"
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <NotFound />
        </DashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <NotFound />
      </div>
    )
  }

  const activeLineupInfo = getStartersForTeam(activeTeam)

  const pageContent = (
    <div className="mx-auto max-w-5xl space-y-lg px-lg py-xl">
      {/* Header */}
      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={
              isDashboard
                ? competitionRoutes.adminMatchDetail(competitionId, matchIdValue)
                : competitionRoutes.matchDetail(competitionId, matchIdValue)
            }
            className="mb-xs inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à partida
          </Link>
          <h1 className="text-2xl font-bold text-on-surface">Prancheta Tática Visual</h1>
          <p className="text-sm text-on-surface-variant">
            {match.home_club_name} vs {match.away_club_name}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-sm">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={savingPositions || players.length === 0}
          >
            <RefreshCw className="mr-xs h-4 w-4" />
            Reiniciar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={savingPositions || players.length === 0}
          >
            {savingPositions ? (
              <Loader2 className="mr-xs h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-xs h-4 w-4" />
            )}
            Guardar Posições
          </Button>
        </div>
      </div>

      {/* Team Selection Tabs */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-sm">
            <Button
              variant={activeTeam === 'home' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTeam('home')}
            >
              {match.home_club_name} (Casa)
            </Button>
            <Button
              variant={activeTeam === 'away' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTeam('away')}
            >
              {match.away_club_name} (Fora)
            </Button>
          </div>

          <div className="flex items-center gap-md">
            <span className="text-sm font-medium text-on-surface-variant">
              Formação: <Badge variant="secondary">{activeLineupInfo.formation}</Badge>
            </span>
            <span className="text-sm font-medium text-on-surface-variant">
              Titulares: <Badge variant="default">{activeLineupInfo.starters.length}</Badge>
            </span>
          </div>
        </div>
      </Card>

      {/* Tactical Canvas Field */}
      {players.length > 0 ? (
        <Card variant="flat" padding="lg" className="flex justify-center overflow-x-auto">
          <TacticalField players={players} onPositionsChange={onPositionsChange} />
        </Card>
      ) : (
        <Card variant="flat" padding="lg">
          <div className="flex flex-col items-center gap-sm py-2xl text-center">
            <Users className="h-12 w-12 text-on-surface-variant/30" />
            <h3 className="text-lg font-semibold text-on-surface">Escalação ainda não definida</h3>
            <p className="max-w-sm text-sm text-on-surface-variant">
              A equipa {activeTeam === 'home' ? match.home_club_name : match.away_club_name} ainda não submeteu a escalação dos 11 titulares para este jogo.
            </p>
          </div>
        </Card>
      )}
    </div>
  )

  if (isDashboard) {
    return (
      <DashboardLayout
        title="Vista Tática"
        subtitle={`${match.home_club_name} vs ${match.away_club_name}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        {pageContent}
      </DashboardLayout>
    )
  }

  return <div className="min-h-screen bg-background">{pageContent}</div>
}
