import React, { useMemo } from 'react'
import { Shield, Trophy, Calendar, MapPin, ArrowRight, Swords } from 'lucide-react'
import { Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { resolveMediaUrl } from '@/lib/media'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import type { Match, Standing } from '../types'

export interface MatchH2HPanelProps {
  match: Match
  competitionId: string
  homeClubId: string
  awayClubId: string
  homeClubName: string
  awayClubName: string
  homeClubLogo?: string | null
  awayClubLogo?: string | null
  standings?: Standing[]
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Data a definir'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function MatchH2HPanel({
  match,
  competitionId,
  homeClubId,
  awayClubId,
  homeClubName,
  awayClubName,
  homeClubLogo,
  awayClubLogo,
  standings = [],
}: MatchH2HPanelProps) {
  const { data: allMatches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)

  // 1. Direct encounters between the two clubs (excluding current match)
  const h2hMatches = useMemo(() => {
    return (allMatches as Match[])
      .filter((m) => {
        if (m.id === match.id) return false
        const isFinished =
          m.status === 'finished' ||
          (m.home_score !== null &&
            m.home_score !== undefined &&
            m.away_score !== null &&
            m.away_score !== undefined)
        if (!isFinished) return false

        const mHomeId = m.home_club || m.homeTeamId
        const mAwayId = m.away_club || m.awayTeamId
        const mHomeName = m.home_club_name || m.homeTeamName
        const mAwayName = m.away_club_name || m.awayTeamName

        const isMatchup =
          (mHomeId === homeClubId && mAwayId === awayClubId) ||
          (mHomeId === awayClubId && mAwayId === homeClubId) ||
          (mHomeName?.toLowerCase() === homeClubName.toLowerCase() &&
            mAwayName?.toLowerCase() === awayClubName.toLowerCase()) ||
          (mHomeName?.toLowerCase() === awayClubName.toLowerCase() &&
            mAwayName?.toLowerCase() === homeClubName.toLowerCase())

        return isMatchup
      })
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
  }, [allMatches, match.id, homeClubId, awayClubId, homeClubName, awayClubName])

  // 2. H2H Aggregate Stats
  const h2hStats = useMemo(() => {
    let homeWins = 0
    let awayWins = 0
    let draws = 0
    let homeGoals = 0
    let awayGoals = 0

    h2hMatches.forEach((m) => {
      const isHomeTeamPlayingAtHome =
        (m.home_club && m.home_club === homeClubId) ||
        (m.home_club_name && m.home_club_name.toLowerCase() === homeClubName.toLowerCase())

      const hScore = m.home_score ?? 0
      const aScore = m.away_score ?? 0

      const thisHomeGoals = isHomeTeamPlayingAtHome ? hScore : aScore
      const thisAwayGoals = isHomeTeamPlayingAtHome ? aScore : hScore

      homeGoals += thisHomeGoals
      awayGoals += thisAwayGoals

      if (thisHomeGoals > thisAwayGoals) homeWins++
      else if (thisAwayGoals > thisHomeGoals) awayWins++
      else draws++
    })

    const totalMatches = h2hMatches.length
    const homePct = totalMatches > 0 ? Math.round((homeWins / totalMatches) * 100) : 0
    const awayPct = totalMatches > 0 ? Math.round((awayWins / totalMatches) * 100) : 0
    const drawPct = totalMatches > 0 ? 100 - homePct - awayPct : 0

    return {
      totalMatches,
      homeWins,
      awayWins,
      draws,
      homeGoals,
      awayGoals,
      homePct,
      awayPct,
      drawPct,
    }
  }, [h2hMatches, homeClubId, homeClubName])

  // 3. Recent Form for Home Club (last 5 finished matches in comp)
  const homeRecentMatches = useMemo(() => {
    return (allMatches as Match[])
      .filter((m) => {
        if (m.id === match.id) return false
        const isFinished =
          m.status === 'finished' || (m.home_score !== null && m.away_score !== null)
        if (!isFinished) return false
        return (
          m.home_club === homeClubId ||
          m.away_club === homeClubId ||
          m.home_club_name?.toLowerCase() === homeClubName.toLowerCase() ||
          m.away_club_name?.toLowerCase() === homeClubName.toLowerCase()
        )
      })
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, 5)
      .map((m) => {
        const isHome =
          m.home_club === homeClubId ||
          m.home_club_name?.toLowerCase() === homeClubName.toLowerCase()
        const myScore = isHome ? m.home_score ?? 0 : m.away_score ?? 0
        const oppScore = isHome ? m.away_score ?? 0 : m.home_score ?? 0
        const oppName = isHome ? m.away_club_name : m.home_club_name
        const oppLogo = resolveMediaUrl(isHome ? (m as any).away_club_logo : (m as any).home_club_logo)

        let result: 'W' | 'D' | 'L' = 'D'
        if (myScore > oppScore) result = 'W'
        else if (myScore < oppScore) result = 'L'

        return {
          match: m,
          result,
          myScore,
          oppScore,
          oppName,
          oppLogo,
          isHome,
        }
      })
  }, [allMatches, match.id, homeClubId, homeClubName])

  // 4. Recent Form for Away Club (last 5 finished matches in comp)
  const awayRecentMatches = useMemo(() => {
    return (allMatches as Match[])
      .filter((m) => {
        if (m.id === match.id) return false
        const isFinished =
          m.status === 'finished' || (m.home_score !== null && m.away_score !== null)
        if (!isFinished) return false
        return (
          m.away_club === awayClubId ||
          m.home_club === awayClubId ||
          m.away_club_name?.toLowerCase() === awayClubName.toLowerCase() ||
          m.home_club_name?.toLowerCase() === awayClubName.toLowerCase()
        )
      })
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, 5)
      .map((m) => {
        const isClubHome =
          m.home_club === awayClubId ||
          m.home_club_name?.toLowerCase() === awayClubName.toLowerCase()
        const myScore = isClubHome ? m.home_score ?? 0 : m.away_score ?? 0
        const oppScore = isClubHome ? m.away_score ?? 0 : m.home_score ?? 0
        const oppName = isClubHome ? m.away_club_name : m.home_club_name
        const oppLogo = resolveMediaUrl(isClubHome ? (m as any).away_club_logo : (m as any).home_club_logo)

        let result: 'W' | 'D' | 'L' = 'D'
        if (myScore > oppScore) result = 'W'
        else if (myScore < oppScore) result = 'L'

        return {
          match: m,
          result,
          myScore,
          oppScore,
          oppName,
          oppLogo,
          isHome: isClubHome,
        }
      })
  }, [allMatches, match.id, awayClubId, awayClubName])

  // 5. Standing stats of both clubs
  const homeStanding = useMemo(() => {
    return (
      standings.find(
        (s) =>
          (homeClubId && s.club === homeClubId) ||
          (s.club_name && s.club_name.toLowerCase() === homeClubName.toLowerCase())
      ) || null
    )
  }, [standings, homeClubId, homeClubName])

  const awayStanding = useMemo(() => {
    return (
      standings.find(
        (s) =>
          (awayClubId && s.club === awayClubId) ||
          (s.club_name && s.club_name.toLowerCase() === awayClubName.toLowerCase())
      ) || null
    )
  }, [standings, awayClubId, awayClubName])

  const homeImg = resolveMediaUrl(homeClubLogo)
  const awayImg = resolveMediaUrl(awayClubLogo)

  return (
    <div className="space-y-lg animate-in fade-in duration-300">
      {/* ─── 1. H2H Header Card & Balance Bar ─────────────────────────────── */}
      <Card variant="flat" padding="lg" className="border-outline-variant/20 bg-surface">
        <CardHeader className="p-none mb-md">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-xs text-on-surface">
              <Swords className="h-5 w-5 text-primary" /> Balanço de Confrontos Diretos
            </CardTitle>
            <Badge variant="outline" className="text-xs font-semibold">
              {h2hStats.totalMatches} {h2hStats.totalMatches === 1 ? 'partida' : 'partidas'}
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Histórico de confrontos oficiais entre as duas equipas nesta competição.
          </p>
        </CardHeader>

        <CardContent className="p-none space-y-md">
          {/* Teams face-to-face summary */}
          <div className="grid grid-cols-3 items-center text-center py-2">
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-surface-container border border-outline-variant/20 p-1 flex items-center justify-center shadow-xs">
                {homeImg ? (
                  <img src={homeImg} alt={homeClubName} className="h-full w-full object-contain rounded-xl" />
                ) : (
                  <span className="text-base font-black text-primary">{homeClubName.charAt(0)}</span>
                )}
              </div>
              <span className="mt-1.5 text-xs font-bold text-on-surface truncate max-w-[130px]" title={homeClubName}>
                {homeClubName}
              </span>
              <span className="text-xl font-black text-primary mt-0.5">
                {h2hStats.homeWins}{' '}
                <span className="text-[11px] font-normal text-on-surface-variant">vitórias</span>
              </span>
            </div>

            {/* Center: Draws & Goals */}
            <div className="flex flex-col items-center">
              <div className="rounded-xl bg-surface-container-high px-3 py-1.5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Empates
                </span>
                <p className="text-xl font-black text-on-surface mt-0.5">{h2hStats.draws}</p>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-2 font-medium">
                Golos: <strong className="text-on-surface">{h2hStats.homeGoals}</strong> vs{' '}
                <strong className="text-on-surface">{h2hStats.awayGoals}</strong>
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-surface-container border border-outline-variant/20 p-1 flex items-center justify-center shadow-xs">
                {awayImg ? (
                  <img src={awayImg} alt={awayClubName} className="h-full w-full object-contain rounded-xl" />
                ) : (
                  <span className="text-base font-black text-primary">{awayClubName.charAt(0)}</span>
                )}
              </div>
              <span className="mt-1.5 text-xs font-bold text-on-surface truncate max-w-[130px]" title={awayClubName}>
                {awayClubName}
              </span>
              <span className="text-xl font-black text-primary mt-0.5">
                {h2hStats.awayWins}{' '}
                <span className="text-[11px] font-normal text-on-surface-variant">vitórias</span>
              </span>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          {h2hStats.totalMatches > 0 && (
            <div className="space-y-1">
              <div className="h-3 w-full rounded-full bg-surface-container-high overflow-hidden flex shadow-inner">
                {h2hStats.homeWins > 0 && (
                  <div
                    style={{ width: `${(h2hStats.homeWins / h2hStats.totalMatches) * 100}%` }}
                    className="bg-primary transition-all duration-500"
                    title={`${homeClubName}: ${h2hStats.homeWins} vitórias`}
                  />
                )}
                {h2hStats.draws > 0 && (
                  <div
                    style={{ width: `${(h2hStats.draws / h2hStats.totalMatches) * 100}%` }}
                    className="bg-amber-500/80 transition-all duration-500"
                    title={`Empates: ${h2hStats.draws}`}
                  />
                )}
                {h2hStats.awayWins > 0 && (
                  <div
                    style={{ width: `${(h2hStats.awayWins / h2hStats.totalMatches) * 100}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`${awayClubName}: ${h2hStats.awayWins} vitórias`}
                  />
                )}
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant px-1">
                <span>{h2hStats.homePct}%</span>
                <span>{h2hStats.drawPct}%</span>
                <span>{h2hStats.awayPct}%</span>
              </div>
            </div>
          )}

          {h2hStats.totalMatches === 0 && !loadingMatches && (
            <div className="rounded-xl bg-surface-container/60 p-md text-center border border-dashed border-outline-variant/30">
              <p className="text-xs text-on-surface-variant font-medium">
                Este é o primeiro confronto direto oficial entre as duas equipas nesta edição da prova.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 2. Past Direct Encounters List ────────────────────────────────── */}
      {h2hMatches.length > 0 && (
        <Card variant="flat" padding="lg" className="border-outline-variant/20 bg-surface">
          <CardHeader className="p-none mb-sm">
            <CardTitle className="text-sm font-bold text-on-surface flex items-center gap-xs">
              <Calendar className="h-4 w-4 text-primary" /> Jogos Anteriores entre Si
            </CardTitle>
          </CardHeader>
          <CardContent className="p-none divide-y divide-outline-variant/15">
            {h2hMatches.map((m) => {
              const isHHome =
                m.home_club === homeClubId ||
                m.home_club_name?.toLowerCase() === homeClubName.toLowerCase()
              return (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs gap-sm">
                  <div className="min-w-[90px]">
                    <span className="font-semibold text-on-surface">{formatDate(m.match_date)}</span>
                    <p className="text-[11px] text-on-surface-variant">
                      {m.round_number ? `Jornada ${m.round_number}` : 'Partida oficial'}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-sm flex-1">
                    <span
                      className={`text-right flex-1 truncate font-semibold ${
                        isHHome ? 'text-primary font-bold' : 'text-on-surface'
                      }`}
                    >
                      {m.home_club_name}
                    </span>

                    <div className="rounded-lg bg-surface-container-high px-2.5 py-1 font-mono font-bold text-on-surface shadow-xs text-xs min-w-[50px] text-center">
                      {m.home_score ?? 0} - {m.away_score ?? 0}
                    </div>

                    <span
                      className={`text-left flex-1 truncate font-semibold ${
                        !isHHome ? 'text-primary font-bold' : 'text-on-surface'
                      }`}
                    >
                      {m.away_club_name}
                    </span>
                  </div>

                  {m.venue && (
                    <span className="text-[11px] text-on-surface-variant hidden md:flex items-center gap-1 max-w-[120px] truncate">
                      <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate">{m.venue}</span>
                    </span>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* ─── 3. Recent Form Comparison (Last 5 Games) ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Home Recent Form */}
        <Card variant="flat" padding="md" className="border-outline-variant/20 bg-surface">
          <CardHeader className="p-none mb-sm flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-on-surface flex items-center gap-1.5 truncate">
              {homeImg ? (
                <img src={homeImg} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
              ) : null}
              <span className="truncate">{homeClubName}</span>
            </CardTitle>
            <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">
              Últimos 5 jogos
            </span>
          </CardHeader>
          <CardContent className="p-none space-y-1.5">
            {homeRecentMatches.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70 py-2">Sem partidas anteriores registadas.</p>
            ) : (
              homeRecentMatches.map(({ match: rm, result, myScore, oppScore, oppName }) => (
                <div
                  key={rm.id}
                  className="flex items-center justify-between rounded-lg bg-surface-container/40 px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Badge
                      className={`w-5 h-5 p-0 flex items-center justify-center font-bold text-[10px] rounded-md shrink-0 ${
                        result === 'W'
                          ? 'bg-emerald-500 text-white'
                          : result === 'L'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {result === 'W' ? 'V' : result === 'L' ? 'D' : 'E'}
                    </Badge>
                    <span className="truncate text-on-surface font-medium" title={oppName}>
                      vs {oppName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-on-surface shrink-0 ml-2">
                    {myScore} - {oppScore}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Away Recent Form */}
        <Card variant="flat" padding="md" className="border-outline-variant/20 bg-surface">
          <CardHeader className="p-none mb-sm flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-on-surface flex items-center gap-1.5 truncate">
              {awayImg ? (
                <img src={awayImg} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
              ) : null}
              <span className="truncate">{awayClubName}</span>
            </CardTitle>
            <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">
              Últimos 5 jogos
            </span>
          </CardHeader>
          <CardContent className="p-none space-y-1.5">
            {awayRecentMatches.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70 py-2">Sem partidas anteriores registadas.</p>
            ) : (
              awayRecentMatches.map(({ match: rm, result, myScore, oppScore, oppName }) => (
                <div
                  key={rm.id}
                  className="flex items-center justify-between rounded-lg bg-surface-container/40 px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Badge
                      className={`w-5 h-5 p-0 flex items-center justify-center font-bold text-[10px] rounded-md shrink-0 ${
                        result === 'W'
                          ? 'bg-emerald-500 text-white'
                          : result === 'L'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {result === 'W' ? 'V' : result === 'L' ? 'D' : 'E'}
                    </Badge>
                    <span className="truncate text-on-surface font-medium" title={oppName}>
                      vs {oppName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-on-surface shrink-0 ml-2">
                    {myScore} - {oppScore}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── 4. Season Performance Comparison ──────────────────────────────── */}
      {(homeStanding || awayStanding) && (
        <Card variant="flat" padding="lg" className="border-outline-variant/20 bg-surface">
          <CardHeader className="p-none mb-md">
            <CardTitle className="text-sm font-bold text-on-surface flex items-center gap-xs">
              <Trophy className="h-4 w-4 text-primary" /> Comparativo na Competição
            </CardTitle>
          </CardHeader>
          <CardContent className="p-none">
            <div className="space-y-sm text-xs">
              <ComparisonRow
                label="Posição na Tabela"
                homeVal={homeStanding?.position ? `#${homeStanding.position}` : '—'}
                awayVal={awayStanding?.position ? `#${awayStanding.position}` : '—'}
                highlight={
                  homeStanding?.position && awayStanding?.position
                    ? homeStanding.position < awayStanding.position
                      ? 'home'
                      : homeStanding.position > awayStanding.position
                      ? 'away'
                      : null
                    : null
                }
              />
              <ComparisonRow
                label="Pontos Conquistados"
                homeVal={homeStanding?.points ?? 0}
                awayVal={awayStanding?.points ?? 0}
                highlight={
                  (homeStanding?.points ?? 0) > (awayStanding?.points ?? 0)
                    ? 'home'
                    : (homeStanding?.points ?? 0) < (awayStanding?.points ?? 0)
                    ? 'away'
                    : null
                }
              />
              <ComparisonRow
                label="Jogos Realizados"
                homeVal={homeStanding?.played ?? 0}
                awayVal={awayStanding?.played ?? 0}
              />
              <ComparisonRow
                label="Vitórias"
                homeVal={homeStanding?.won ?? 0}
                awayVal={awayStanding?.won ?? 0}
                highlight={
                  (homeStanding?.won ?? 0) > (awayStanding?.won ?? 0)
                    ? 'home'
                    : (homeStanding?.won ?? 0) < (awayStanding?.won ?? 0)
                    ? 'away'
                    : null
                }
              />
              <ComparisonRow
                label="Empates"
                homeVal={homeStanding?.drawn ?? 0}
                awayVal={awayStanding?.drawn ?? 0}
              />
              <ComparisonRow
                label="Derrotas"
                homeVal={homeStanding?.lost ?? 0}
                awayVal={awayStanding?.lost ?? 0}
              />
              <ComparisonRow
                label="Golos Marcados"
                homeVal={homeStanding?.goals_for ?? 0}
                awayVal={awayStanding?.goals_for ?? 0}
                highlight={
                  (homeStanding?.goals_for ?? 0) > (awayStanding?.goals_for ?? 0)
                    ? 'home'
                    : (homeStanding?.goals_for ?? 0) < (awayStanding?.goals_for ?? 0)
                    ? 'away'
                    : null
                }
              />
              <ComparisonRow
                label="Golos Sofridos"
                homeVal={homeStanding?.goals_against ?? 0}
                awayVal={awayStanding?.goals_against ?? 0}
                highlight={
                  (homeStanding?.goals_against ?? 0) < (awayStanding?.goals_against ?? 0)
                    ? 'home'
                    : (homeStanding?.goals_against ?? 0) > (awayStanding?.goals_against ?? 0)
                    ? 'away'
                    : null
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ComparisonRow({
  label,
  homeVal,
  awayVal,
  highlight,
}: {
  label: string
  homeVal: string | number
  awayVal: string | number
  highlight?: 'home' | 'away' | null
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
      <span
        className={`w-20 font-bold text-left ${
          highlight === 'home' ? 'text-primary font-extrabold' : 'text-on-surface'
        }`}
      >
        {homeVal}
      </span>
      <span className="flex-1 text-center font-medium text-on-surface-variant text-[11px]">
        {label}
      </span>
      <span
        className={`w-20 font-bold text-right ${
          highlight === 'away' ? 'text-primary font-extrabold' : 'text-on-surface'
        }`}
      >
        {awayVal}
      </span>
    </div>
  )
}
