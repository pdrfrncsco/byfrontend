import React, { useMemo } from 'react'
import type { LineupPlayer, MatchEvent } from '../../types'
import { generateTacticalPositions } from '../../utils/tactical.utils'
import { Crown, Goal, ShieldAlert, ArrowRightLeft } from 'lucide-react'

export interface BolaYetuPitchFieldProps {
  homeStarters: LineupPlayer[]
  awayStarters: LineupPlayer[]
  homeFormation?: string
  awayFormation?: string
  homeTeamName?: string
  awayTeamName?: string
  homeColor?: string
  awayColor?: string
  events?: MatchEvent[]
  activePlayerId?: string | null
  onPlayerClick?: (player: LineupPlayer, isHome: boolean) => void
  className?: string
}

export interface EnrichedPitchPlayer {
  tacticalId: string
  player: LineupPlayer
  isHome: boolean
  x: number // 0..1 normalized
  y: number // 0..1 normalized
  shortName: string
  number: number | string
  avatarUrl?: string
  isGK: boolean
  isCaptain: boolean
  goalsCount: number
  hasYellowCard: boolean
  hasRedCard: boolean
  isSubstituted: boolean
  subMinute?: number
  subPlayerInName?: string
}

export function getShortName(fullName?: string): string {
  if (!fullName) return 'Jogador'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  // SofaScore style: "J. Vázquez" or "Pedri" or "L. Yamal"
  const firstInitial = parts[0].charAt(0).toUpperCase()
  const lastName = parts[parts.length - 1]
  return `${firstInitial}. ${lastName}`
}

export function getPlayerIdentifiers(player: LineupPlayer): { ids: Set<string>; names: Set<string> } {
  const ids = new Set<string>()
  const names = new Set<string>()

  const addId = (id: any) => {
    if (id != null && id !== '' && id !== 'undefined' && id !== 'null') {
      ids.add(String(id).toLowerCase())
    }
  }

  const addName = (name: any) => {
    if (typeof name === 'string' && name.trim()) {
      names.add(name.trim().toLowerCase())
    }
  }

  addId(player.player_id)
  addId(player.playerId)
  addId(player.player?.id)
  addId(player.id)

  addName(player.player?.full_name)
  addName(player.playerName)
  addName((player as any).name)
  const pAny = player.player as any
  if (pAny?.first_name || pAny?.last_name) {
    addName(`${pAny.first_name || ''} ${pAny.last_name || ''}`.trim())
  }

  return { ids, names }
}

export function eventMatchesPlayer(
  targetId: any,
  targetName: any,
  player: LineupPlayer
): boolean {
  const { ids, names } = getPlayerIdentifiers(player)
  const resolvedId =
    typeof targetId === 'object' && targetId ? targetId.id : targetId

  if (resolvedId && ids.has(String(resolvedId).toLowerCase())) {
    return true
  }

  if (typeof targetName === 'string' && targetName.trim()) {
    if (names.has(targetName.trim().toLowerCase())) {
      return true
    }
  }

  return false
}

export function getPlayerMatchEvents(player: LineupPlayer, events: MatchEvent[]) {
  let goals = 0
  let yellowCards = 0
  let redCards = 0
  let isSubstitutedOut = false
  let subOutMinute: number | undefined
  let subInPlayerName: string | undefined
  let isSubstitutedIn = false
  let subInMinute: number | undefined
  let subOutPlayerName: string | undefined

  events.forEach(e => {
    const type = String(e.type || (e as any).event_type || '').toLowerCase()
    const pId = e.playerId || e.player || (e as any).player_id
    const ep = e.player as any
    const pName = e.player_name || (e as any).player_full_name || (ep && typeof ep === 'object' ? ep.full_name : undefined)
    const pOffId = e.player_off || (e as any).player_off_id || e.substitutedPlayerId
    const epo = e.player_off as any
    const pOffName = e.player_off_name || (e as any).player_off_full_name || (epo && typeof epo === 'object' ? epo.full_name : undefined)

    const matchesPrimary = eventMatchesPlayer(pId, pName, player)
    const matchesOff = eventMatchesPlayer(pOffId, pOffName, player)

    // Goals: goal, penalty_scored, penalty_goal
    if (matchesPrimary && (type === 'goal' || type === 'penalty_scored' || type === 'penalty_goal' || (type.includes('goal') && type !== 'own_goal'))) {
      goals += 1
    }

    // Yellow cards
    if (matchesPrimary && type === 'yellow_card') {
      yellowCards += 1
    }

    // Red cards & 2nd yellows
    if (matchesPrimary && (type === 'red_card' || type === 'yellow_red' || type === 'yellow_red_card')) {
      redCards += 1
    }

    // Substitutions
    if (type.includes('substitution')) {
      if (matchesOff) {
        isSubstitutedOut = true
        subOutMinute = e.minute
        subInPlayerName = pName
      }
      if (matchesPrimary) {
        if (type === 'substitution_out') {
          isSubstitutedOut = true
          subOutMinute = e.minute
          subInPlayerName = pOffName || e.notes || undefined
        } else {
          isSubstitutedIn = true
          subInMinute = e.minute
          subOutPlayerName = pOffName
        }
      }
    }
  })

  return {
    goals,
    yellowCards,
    redCards,
    isSubstitutedOut,
    subOutMinute,
    subInPlayerName,
    isSubstitutedIn,
    subInMinute,
    subOutPlayerName,
  }
}

export function BolaYetuPitchField({
  homeStarters = [],
  awayStarters = [],
  homeFormation = '4-3-3',
  awayFormation = '4-3-3',
  homeTeamName = 'Casa',
  awayTeamName = 'Fora',
  homeColor = '#2563eb',
  awayColor = '#dc2626',
  events = [],
  activePlayerId,
  onPlayerClick,
  className = '',
}: BolaYetuPitchFieldProps) {
  // SVG Dimensions
  const width = 1000
  const height = 660
  const marginX = 30
  const marginY = 24
  const pitchW = width - marginX * 2
  const pitchH = height - marginY * 2
  const midX = width / 2
  const midY = height / 2

  // Tactical layout coordinates
  const homePositions = useMemo(
    () => generateTacticalPositions(homeStarters, homeFormation, true),
    [homeStarters, homeFormation]
  )

  const awayPositions = useMemo(
    () => generateTacticalPositions(awayStarters, awayFormation, false),
    [awayStarters, awayFormation]
  )

  // Combine tactical positions with player data
  const enrichPlayers = (
    starters: LineupPlayer[],
    positions: typeof homePositions,
    isHome: boolean
  ): EnrichedPitchPlayer[] => {
    return starters.map((player, idx) => {
      const pId = player.id || player.playerId || player.player_id || `idx-${idx}`
      const pos = positions[idx] || {
        x: isHome ? 0.08 + idx * 0.03 : 0.92 - idx * 0.03,
        y: 0.15 + (idx % 5) * 0.15,
      }

      const ev = getPlayerMatchEvents(player, events)

      const rawPos = player.positionSpecific || player.position
      const isGK = Boolean(
        player.is_goalkeeper ||
          String(rawPos).toUpperCase().includes('GK') ||
          String(rawPos).toUpperCase().includes('GR')
      )

      return {
        tacticalId: `${isHome ? 'home' : 'away'}-${pId}`,
        player,
        isHome,
        x: pos.x,
        y: pos.y,
        shortName: getShortName(player.playerName || player.player?.full_name),
        number: player.shirt_number || player.playerNumber || idx + 1,
        avatarUrl: player.avatarUrl || (player.player as any)?.avatar,
        isGK,
        isCaptain: Boolean(player.is_captain),
        goalsCount: ev.goals,
        hasYellowCard: ev.yellowCards > 0,
        hasRedCard: ev.redCards > 0,
        isSubstituted: ev.isSubstitutedOut,
        subMinute: ev.subOutMinute,
        subPlayerInName: ev.subInPlayerName,
      }
    })
  }

  const enrichedHome = useMemo(
    () => enrichPlayers(homeStarters, homePositions, true),
    [homeStarters, homePositions, events]
  )

  const enrichedAway = useMemo(
    () => enrichPlayers(awayStarters, awayPositions, false),
    [awayStarters, awayPositions, events]
  )

  const allPlayers = [...enrichedHome, ...enrichedAway]

  // Box dimensions
  const penW = 160
  const penH = 320
  const goalAreaW = 55
  const goalAreaH = 150
  const penSpotDist = 105
  const centerRadius = 75

  return (
    <div className={`relative w-full select-none overflow-hidden rounded-2xl ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto drop-shadow-xl block"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <defs>
          {/* Soccer pitch turf gradient */}
          <linearGradient id="bolayetu-pitch-turf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a5933" />
            <stop offset="50%" stopColor="#164d2c" />
            <stop offset="100%" stopColor="#123f24" />
          </linearGradient>

          {/* Alternating lawn stripes (SofaScore pattern) */}
          <pattern id="turf-stripes-pattern" width="80" height={height} patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="40" height={height} fill="rgba(255, 255, 255, 0.025)" />
            <rect x="40" y="0" width="40" height={height} fill="transparent" />
          </pattern>

          {/* Soft turf vignette effect */}
          <radialGradient id="turf-vignette" cx="50%" cy="50%" r="65%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.35)" />
          </radialGradient>

          {/* Drop shadow filter for player tokens */}
          <filter id="token-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. Base Pitch Grass */}
        <rect x={0} y={0} width={width} height={height} rx={20} fill="url(#bolayetu-pitch-turf)" />
        <rect x={0} y={0} width={width} height={height} fill="url(#turf-stripes-pattern)" />
        <rect x={0} y={0} width={width} height={height} rx={20} fill="url(#turf-vignette)" />

        {/* 2. Outer boundary line */}
        <rect
          x={marginX}
          y={marginY}
          width={pitchW}
          height={pitchH}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={2.5}
        />

        {/* 3. Halfway line */}
        <line
          x1={midX}
          y1={marginY}
          x2={midX}
          y2={height - marginY}
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={2.5}
        />

        {/* 4. Center Circle & Spot */}
        <circle
          cx={midX}
          cy={midY}
          r={centerRadius}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2}
        />
        <circle cx={midX} cy={midY} r={4} fill="rgba(255,255,255,0.85)" />

        {/* 5. Left Penalty Box (Home goal) */}
        <rect
          x={marginX}
          y={midY - penH / 2}
          width={penW}
          height={penH}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2}
        />
        {/* Left Goal Area (6-yard box) */}
        <rect
          x={marginX}
          y={midY - goalAreaH / 2}
          width={goalAreaW}
          height={goalAreaH}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
        />
        {/* Left Penalty Spot */}
        <circle cx={marginX + penSpotDist} cy={midY} r={3} fill="rgba(255,255,255,0.85)" />
        {/* Left Penalty Arc (D) */}
        <path
          d={`M ${marginX + penW} ${midY - 45} A 60 60 0 0 1 ${marginX + penW} ${midY + 45}`}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
        />

        {/* 6. Right Penalty Box (Away goal) */}
        <rect
          x={width - marginX - penW}
          y={midY - penH / 2}
          width={penW}
          height={penH}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2}
        />
        {/* Right Goal Area */}
        <rect
          x={width - marginX - goalAreaW}
          y={midY - goalAreaH / 2}
          width={goalAreaW}
          height={goalAreaH}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
        />
        {/* Right Penalty Spot */}
        <circle cx={width - marginX - penSpotDist} cy={midY} r={3} fill="rgba(255,255,255,0.85)" />
        {/* Right Penalty Arc (D) */}
        <path
          d={`M ${width - marginX - penW} ${midY - 45} A 60 60 0 0 0 ${width - marginX - penW} ${midY + 45}`}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
        />

        {/* 7. Corner Arcs */}
        <path d={`M ${marginX + 15} ${marginY} A 15 15 0 0 1 ${marginX} ${marginY + 15}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        <path d={`M ${marginX} ${height - marginY - 15} A 15 15 0 0 1 ${marginX + 15} ${height - marginY}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        <path d={`M ${width - marginX - 15} ${marginY} A 15 15 0 0 0 ${width - marginX} ${marginY + 15}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        <path d={`M ${width - marginX} ${height - marginY - 15} A 15 15 0 0 0 ${width - marginX - 15} ${height - marginY}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />

        {/* 8. Goal Indicators */}
        <rect x={marginX - 8} y={midY - 40} width={8} height={80} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
        <rect x={width - marginX} y={midY - 40} width={8} height={80} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />

        {/* 9. Player Tokens */}
        {allPlayers.map(p => {
          const cx = p.x * width
          const cy = p.y * height
          const pId = p.player.id || p.player.playerId || p.player.player_id
          const isActive = activePlayerId === pId

          const baseBorderColor = p.isGK
            ? '#f59e0b'
            : p.isHome
              ? homeColor || '#3b82f6'
              : awayColor || '#ef4444'

          return (
            <g
              key={p.tacticalId}
              transform={`translate(${cx}, ${cy})`}
              filter="url(#token-shadow)"
              className="cursor-pointer select-none group"
              onClick={() => onPlayerClick?.(p.player, p.isHome)}
            >
              {/* Outer halo when active */}
              {isActive && (
                <circle r={26} fill="none" stroke="#ffffff" strokeWidth={3} className="animate-pulse" />
              )}

              {/* Substituted Out dashed halo */}
              {p.isSubstituted && (
                <circle
                  r={24}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={1.8}
                  strokeDasharray="4 2"
                  opacity={0.9}
                />
              )}

              {/* Hover ring (safe SVG hover effect without CSS transform) */}
              <circle
                r={24}
                fill="none"
                stroke={baseBorderColor}
                strokeWidth={2}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              />

              {/* Player Avatar Circle Background */}
              <circle
                r={20}
                fill={p.isGK ? '#78350f' : p.isHome ? '#1e3a8a' : '#7f1d1d'}
                stroke={p.isSubstituted ? '#f87171' : baseBorderColor}
                strokeWidth={2.5}
                opacity={p.isSubstituted ? 0.82 : 1}
                className="transition-all duration-150 group-hover:stroke-[3.5px] group-hover:brightness-110"
              />

              {/* Player Avatar Photo (if available) */}
              {p.avatarUrl ? (
                <g opacity={p.isSubstituted ? 0.82 : 1}>
                  <clipPath id={`clip-${p.tacticalId}`}>
                    <circle r={18} />
                  </clipPath>
                  <image
                    href={p.avatarUrl}
                    x={-18}
                    y={-18}
                    width={36}
                    height={36}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-${p.tacticalId})`}
                  />
                </g>
              ) : (
                /* Fallback Jersey Number inside circle */
                <text
                  textAnchor="middle"
                  y={6}
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="monospace"
                  opacity={p.isSubstituted ? 0.82 : 1}
                >
                  {p.number}
                </text>
              )}

              {/* Small Badge with Jersey Number if avatar is present */}
              {p.avatarUrl && (
                <g transform="translate(-14, -14)">
                  <circle r={8} fill="rgba(15, 23, 42, 0.9)" stroke={baseBorderColor} strokeWidth={1} />
                  <text
                    textAnchor="middle"
                    y={3}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {p.number}
                  </text>
                </g>
              )}

              {/* Captain Badge (C) */}
              {p.isCaptain && (
                <g transform="translate(14, -14)">
                  <circle r={7.5} fill="#f59e0b" stroke="#ffffff" strokeWidth={1} />
                  <text
                    textAnchor="middle"
                    y={3}
                    fill="#1e293b"
                    fontSize="8.5"
                    fontWeight="900"
                  >
                    C
                  </text>
                </g>
              )}

              {/* Events: Goal Badge */}
              {p.goalsCount > 0 && (
                <g transform="translate(14, 12)">
                  <circle r={8} fill="#10b981" stroke="#ffffff" strokeWidth={1} />
                  <text
                    textAnchor="middle"
                    y={3}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ⚽{p.goalsCount > 1 ? p.goalsCount : ''}
                  </text>
                </g>
              )}

              {/* Events: Yellow/Red Card Badge */}
              {(p.hasYellowCard || p.hasRedCard) && (
                <g transform="translate(-14, 12)">
                  <rect
                    x={-4}
                    y={-6}
                    width={8}
                    height={11}
                    rx={1.5}
                    fill={p.hasRedCard ? '#ef4444' : '#eab308'}
                    stroke="#ffffff"
                    strokeWidth={0.8}
                  />
                </g>
              )}

              {/* Events: Substitution Badge */}
              {p.isSubstituted && (
                <g transform="translate(0, -18)">
                  <rect
                    x={-17}
                    y={-6.5}
                    width={34}
                    height={13}
                    rx={3.5}
                    fill="#dc2626"
                    stroke="#ffffff"
                    strokeWidth={0.8}
                  />
                  <text
                    textAnchor="middle"
                    y={3}
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ⇄ {p.subMinute != null ? `${p.subMinute}'` : 'SUB'}
                  </text>
                </g>
              )}

              {/* Player Short Name Banner beneath player */}
              <g transform="translate(0, 32)">
                <rect
                  x={-44}
                  y={-9}
                  width={88}
                  height={p.isSubstituted && p.subPlayerInName ? 26 : 17}
                  rx={4}
                  fill="rgba(15, 23, 42, 0.88)"
                  stroke={p.isSubstituted ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={0.8}
                />
                <text
                  textAnchor="middle"
                  y={3}
                  fill="#f8fafc"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {p.shortName}
                </text>
                {p.isSubstituted && p.subPlayerInName && (
                  <text
                    textAnchor="middle"
                    y={14}
                    fill="#fca5a5"
                    fontSize="7.5"
                    fontWeight="600"
                    fontFamily="system-ui, sans-serif"
                  >
                    ⇄ {p.subMinute != null ? `${p.subMinute}' ` : ''}{getShortName(p.subPlayerInName)}
                  </text>
                )}
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
