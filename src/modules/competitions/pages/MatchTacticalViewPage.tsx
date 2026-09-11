import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, RefreshCw, AlertCircle, Users, Compass, Eye } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import { useLineups } from '../hooks/useLineups'
import { useTacticalPositions } from '../hooks/useTacticalPositions'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import TacticalField, { TacticalPlayer } from '../components/tactical/TacticalField'
import { generateTacticalPositions } from '../utils/tactical.utils'
import type { Match, LineupSubmission, LineupPlayer } from '../types'
import { toast } from 'sonner'
import { useSeo } from '@/hooks/useSeo'

export default function MatchTacticalViewPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''

  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const { isAdmin, isMatchOperator } = useCompetitionAccess()

  // Fetch match details and lineups
  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(matchIdValue)

  const match = (matches as Match[]).find((m) => m.id === matchIdValue)
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  useSeo({
    title: match
      ? `Quadro Tático — ${match.home_club_name || match.homeTeamName} vs ${match.away_club_name || match.awayTeamName}`
      : 'Quadro Tático',
    description: 'Simulação e visualização interativa do posicionamento tático dos jogadores no relvado.',
    path: `/competitions/${competitionId}/matches/${matchIdValue}/tactical`,
  })

  // Find home and away lineups
  const homeLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.home_club)
  const awayLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.away_club)

  // View filter: 'both' (default) or single team focus
  const [activeTeam, setActiveTeam] = useState<'both' | 'home' | 'away'>('both')
  const [players, setPlayers] = useState<TacticalPlayer[]>([])

  const homeClubId = match?.home_club
  const awayClubId = match?.away_club

  const { loadPositions: loadHomePositions, savePositions: saveHomePositions, loading: savingHome } = useTacticalPositions(
    matchIdValue,
    homeClubId
  )

  const { loadPositions: loadAwayPositions, savePositions: saveAwayPositions, loading: savingAway } = useTacticalPositions(
    matchIdValue,
    awayClubId
  )

  const savingPositions = savingHome || savingAway
  const canSave = isAdmin || isMatchOperator

  // Extract starters for a team
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

  // Load tactical positions
  const loadTacticalData = useCallback(async () => {
    if (!match) return

    // 1. Fetch home positions
    const { starters: homeStarters, formation: homeFormation } = getStartersForTeam('home')
    const customHome = await loadHomePositions()
    let homeTactical: TacticalPlayer[] = []
    if (customHome && customHome.length > 0) {
      homeTactical = customHome.map(p => ({ ...p, team: 'home' as const }))
    } else if (homeStarters.length > 0) {
      homeTactical = generateTacticalPositions(homeStarters, homeFormation, true).map((p, i) => {
        const rawPos = homeStarters[i]?.positionSpecific || homeStarters[i]?.position
        const isGK = Boolean(
          homeStarters[i]?.is_goalkeeper ||
          String(rawPos).toUpperCase().includes('GK') ||
          String(rawPos).toUpperCase().includes('GR') ||
          String(p.id).includes('gk')
        )
        return { ...p, team: 'home' as const, isGK }
      })
    }

    // 2. Fetch away positions
    const { starters: awayStarters, formation: awayFormation } = getStartersForTeam('away')
    const customAway = await loadAwayPositions()
    let awayTactical: TacticalPlayer[] = []
    if (customAway && customAway.length > 0) {
      awayTactical = customAway.map(p => ({ ...p, team: 'away' as const }))
    } else if (awayStarters.length > 0) {
      awayTactical = generateTacticalPositions(awayStarters, awayFormation, false).map((p, i) => {
        const rawPos = awayStarters[i]?.positionSpecific || awayStarters[i]?.position
        const isGK = Boolean(
          awayStarters[i]?.is_goalkeeper ||
          String(rawPos).toUpperCase().includes('GK') ||
          String(rawPos).toUpperCase().includes('GR') ||
          String(p.id).includes('gk')
        )
        return { ...p, team: 'away' as const, isGK }
      })
    }

    if (activeTeam === 'home') {
      setPlayers(homeTactical)
    } else if (activeTeam === 'away') {
      setPlayers(awayTactical)
    } else {
      setPlayers([...homeTactical, ...awayTactical])
    }
  }, [match, loadHomePositions, loadAwayPositions, getStartersForTeam, activeTeam])

  useEffect(() => {
    loadTacticalData()
  }, [loadTacticalData])

  const onPositionsChange = useCallback((next: TacticalPlayer[]) => {
    setPlayers(next)
  }, [])

  const handleSave = async () => {
    try {
      const homePlayersToSave = players.filter(p => p.team === 'home' || !p.team)
      const awayPlayersToSave = players.filter(p => p.team === 'away')

      if (homeClubId && (activeTeam === 'both' || activeTeam === 'home') && homePlayersToSave.length > 0) {
        await saveHomePositions(homePlayersToSave)
      }
      if (awayClubId && (activeTeam === 'both' || activeTeam === 'away') && awayPlayersToSave.length > 0) {
        await saveAwayPositions(awayPlayersToSave)
      }
      toast.success('Posições táticas guardadas com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao guardar posições: ' + (err?.message || String(err)))
    }
  }

  const handleReset = () => {
    const { starters: homeStarters, formation: homeFormation } = getStartersForTeam('home')
    const { starters: awayStarters, formation: awayFormation } = getStartersForTeam('away')

    const homeTactical = generateTacticalPositions(homeStarters, homeFormation, true).map((p, i) => {
      const rawPos = homeStarters[i]?.positionSpecific || homeStarters[i]?.position
      const isGK = Boolean(
        homeStarters[i]?.is_goalkeeper ||
        String(rawPos).toUpperCase().includes('GK') ||
        String(rawPos).toUpperCase().includes('GR') ||
        String(p.id).includes('gk')
      )
      return { ...p, team: 'home' as const, isGK }
    })

    const awayTactical = generateTacticalPositions(awayStarters, awayFormation, false).map((p, i) => {
      const rawPos = awayStarters[i]?.positionSpecific || awayStarters[i]?.position
      const isGK = Boolean(
        awayStarters[i]?.is_goalkeeper ||
        String(rawPos).toUpperCase().includes('GK') ||
        String(rawPos).toUpperCase().includes('GR') ||
        String(p.id).includes('gk')
      )
      return { ...p, team: 'away' as const, isGK }
    })

    if (activeTeam === 'home') {
      setPlayers(homeTactical)
    } else if (activeTeam === 'away') {
      setPlayers(awayTactical)
    } else {
      setPlayers([...homeTactical, ...awayTactical])
    }
    toast.info('Posições reiniciadas para o padrão tático.')
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
          title="Quadro Tático"
          subtitle="A carregar..."
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <LoadingState />
        </DashboardLayout>
      )
    }
    return (
      <div className="max-w-6xl mx-auto px-lg py-xl">
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
      <div className="max-w-6xl mx-auto px-lg py-xl">
        <NotFound />
      </div>
    )
  }

  const homeInfo = getStartersForTeam('home')
  const awayInfo = getStartersForTeam('away')
  const homeName = match.home_club_name || match.homeTeamName || 'Casa'
  const awayName = match.away_club_name || match.awayTeamName || 'Fora'

  // Breadcrumb
  const breadcrumb = (
    <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-xs sm:text-sm text-on-surface-variant mb-md overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link to="/competitions" className="hover:text-primary transition-colors">
        Competições
      </Link>
      <span aria-hidden="true" className="opacity-40">/</span>
      <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary transition-colors">
        {competition?.name || 'Competição'}
      </Link>
      <span aria-hidden="true" className="opacity-40">/</span>
      <Link
        to={
          isDashboard
            ? competitionRoutes.adminMatchDetail(competitionId, matchIdValue)
            : competitionRoutes.matchDetail(competitionId, matchIdValue)
        }
        className="hover:text-primary transition-colors"
      >
        {homeName} vs {awayName}
      </Link>
      <span aria-hidden="true" className="opacity-40">/</span>
      <span className="font-semibold text-on-surface">
        Quadro Tático
      </span>
    </nav>
  )

  const pageContent = (
    <div className="max-w-6xl mx-auto px-md sm:px-lg py-md space-y-md">
      {/* Breadcrumb */}
      {breadcrumb}

      {/* Header Bar: Title, Match details and Action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md p-md sm:p-lg rounded-2xl border border-outline-variant/15 bg-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              Quadro Tático
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            {homeName} <span className="opacity-50">vs</span> {awayName}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-sm">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={savingPositions || players.length === 0}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reiniciar
          </Button>

          {canSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={savingPositions || players.length === 0}
              className="text-xs"
            >
              {savingPositions ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Guardar Posições
            </Button>
          )}

          <Link
            to={
              isDashboard
                ? competitionRoutes.adminMatchDetail(competitionId, matchIdValue)
                : competitionRoutes.matchDetail(competitionId, matchIdValue)
            }
          >
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar: Segmented control for Team Focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm p-sm sm:px-md rounded-xl border border-outline-variant/15 bg-surface-container">
        {/* Pills */}
        <div className="inline-flex p-1 rounded-lg bg-surface-container-high/60 gap-1 overflow-x-auto scrollbar-hide text-xs">
          <button
            type="button"
            onClick={() => setActiveTeam('both')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTeam === 'both'
                ? 'bg-surface shadow-sm text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ambas as Equipas</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary">
              {players.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTeam('home')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTeam === 'home'
                ? 'bg-surface shadow-sm text-blue-500 font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{homeName}</span>
            <span className="text-[11px] opacity-70">({homeInfo.formation})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTeam('away')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTeam === 'away'
                ? 'bg-surface shadow-sm text-red-500 font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{awayName}</span>
            <span className="text-[11px] opacity-70">({awayInfo.formation})</span>
          </button>
        </div>

        {/* Formations legend */}
        <div className="flex items-center gap-md text-xs text-on-surface-variant font-medium px-1">
          <span>
            {homeName}: <span className="font-bold text-on-surface">{homeInfo.formation}</span>
          </span>
          <span className="opacity-30">|</span>
          <span>
            {awayName}: <span className="font-bold text-on-surface">{awayInfo.formation}</span>
          </span>
        </div>
      </div>

      {/* Tactical Canvas Field */}
      {players.length > 0 ? (
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container overflow-hidden shadow-lg p-md sm:p-lg flex flex-col items-center">
          <TacticalField players={players} onPositionsChange={onPositionsChange} />
          
          <p className="mt-md text-center text-xs text-on-surface-variant/70 font-medium">
            💡 Dica: Arraste os jogadores no relvado para simular e ajustar posicionamentos táticos em tempo real.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-2xl text-center">
          <Users className="h-12 w-12 text-on-surface-variant/30 mx-auto mb-sm" />
          <h3 className="text-base font-bold text-on-surface">Escalação ainda não definida</h3>
          <p className="max-w-md mx-auto text-xs text-on-surface-variant mt-1 leading-relaxed">
            As equipas ainda não submeteram os titulares para este confronto. A prancheta tática estará disponível assim que as escalações forem registadas.
          </p>
        </div>
      )}
    </div>
  )

  if (isDashboard) {
    return (
      <DashboardLayout
        title="Quadro Tático"
        subtitle={`${homeName} vs ${awayName}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        {pageContent}
      </DashboardLayout>
    )
  }

  return pageContent
}
