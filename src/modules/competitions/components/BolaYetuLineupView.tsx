import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Shield,
  UserCheck,
  ArrowRightLeft,
  Crown,
  AlertCircle,
  Check,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { BolaYetuPitchField } from './tactical/BolaYetuPitchField'
import type { Match, LineupSubmission, LineupPlayer, MatchEvent } from '../types'

export interface BolaYetuLineupViewProps {
  match: Match
  homeLineup?: LineupSubmission
  awayLineup?: LineupSubmission
  events?: MatchEvent[]
  editable?: boolean
  onEditLineup?: (clubId: string) => void
  onConfirmLineup?: (clubId: string) => void
  onConfirmPending?: boolean
  canReviewLineups?: boolean
  className?: string
}

function TeamHeaderBadge({
  name,
  formation,
  logo,
  isHome,
}: {
  name: string
  formation: string
  logo?: string | null
  isHome: boolean
}) {
  const [imgError, setImgError] = useState(false)
  const initial = name ? name.charAt(0).toUpperCase() : '?'

  return (
    <div
      className={`flex items-center gap-md ${
        isHome ? 'flex-row' : 'flex-row-reverse text-right'
      }`}
    >
      <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-outline-variant/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
        {logo && !imgError ? (
          <img
            src={logo}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-sm sm:text-base font-bold text-primary">{initial}</span>
        )}
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-on-surface truncate max-w-[140px] sm:max-w-[200px]">
          {name}
        </h3>
        <div className={`flex items-center gap-1.5 mt-0.5 ${isHome ? 'justify-start' : 'justify-end'}`}>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
            {formation || '4-3-3'}
          </span>
        </div>
      </div>
    </div>
  )
}

function SubstituteItem({
  player,
  events = [],
  isHome,
}: {
  player: LineupPlayer
  events?: MatchEvent[]
  isHome: boolean
}) {
  const pId = player.id || player.playerId || player.player_id
  const name = player.playerName || player.player?.full_name || 'Jogador'
  const number = player.shirt_number || player.playerNumber || '-'
  const avatar = player.avatarUrl || (player.player as any)?.avatar

  // Look for substitution events involving this player
  const subEvent = events.find(e => {
    const isSub = String(e.type || (e as any).event_type || '').includes('substitution')
    if (!isSub) return false
    return (
      String(e.playerId || e.player) === String(pId) ||
      String(e.substitutedPlayerId || e.player_off) === String(pId)
    )
  })

  let subText: string | null = null
  if (subEvent) {
    const isIncoming = String(subEvent.playerId || subEvent.player) === String(pId)
    if (isIncoming) {
      subText = `${subEvent.minute}' Entrou${subEvent.player_off_name ? ` (Saiu: ${subEvent.player_off_name})` : ''}`
    } else {
      subText = `${subEvent.minute}' Saiu${subEvent.player_name ? ` (Entrou: ${subEvent.player_name})` : ''}`
    }
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-outline-variant/10 bg-surface-container hover:bg-surface-container-high transition-colors">
      <div className="flex items-center gap-sm min-w-0">
        <span className="w-5 text-center font-mono text-xs font-bold text-primary flex-shrink-0">
          {number}
        </span>
        <div className="h-7 w-7 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 overflow-hidden text-[11px] font-bold text-on-surface-variant">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-on-surface truncate">{name}</p>
          {subText ? (
            <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
              <ArrowRightLeft className="w-2.5 h-2.5" />
              <span>{subText}</span>
            </p>
          ) : (
            <p className="text-[10px] text-on-surface-variant">
              {player.positionSpecific || player.position || 'Suplente'}
            </p>
          )}
        </div>
      </div>

      {player.is_captain && (
        <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 ml-1" />
      )}
    </div>
  )
}

export function BolaYetuLineupView({
  match,
  homeLineup,
  awayLineup,
  events = [],
  editable = false,
  onEditLineup,
  onConfirmLineup,
  onConfirmPending = false,
  canReviewLineups = false,
  className = '',
}: BolaYetuLineupViewProps) {
  const [activePlayer, setActivePlayer] = useState<LineupPlayer | null>(null)

  const homeName = match.home_club_name || match.homeTeamName || 'Casa'
  const awayName = match.away_club_name || match.awayTeamName || 'Fora'
  const homeLogo = match.home_club_logo || match.homeTeamLogo
  const awayLogo = match.away_club_logo || match.awayTeamLogo

  const homeFormation = homeLineup?.formation || '4-3-3'
  const awayFormation = awayLineup?.formation || '4-3-3'

  const homeStarters: LineupPlayer[] =
    homeLineup?.starters ??
    homeLineup?.lineup_players?.filter((p: any) => String(p.status).toLowerCase() === 'starter') ??
    []

  const awayStarters: LineupPlayer[] =
    awayLineup?.starters ??
    awayLineup?.lineup_players?.filter((p: any) => String(p.status).toLowerCase() === 'starter') ??
    []

  const homeSubs: LineupPlayer[] =
    homeLineup?.substitutes ??
    homeLineup?.lineup_players?.filter((p: any) => String(p.status).toLowerCase() === 'substitute') ??
    []

  const awaySubs: LineupPlayer[] =
    awayLineup?.substitutes ??
    awayLineup?.lineup_players?.filter((p: any) => String(p.status).toLowerCase() === 'substitute') ??
    []

  const homeCoach = (homeLineup as any)?.coach || (match as any)?.home_coach
  const awayCoach = (awayLineup as any)?.coach || (match as any)?.away_coach

  const hasStarters = homeStarters.length > 0 || awayStarters.length > 0

  return (
    <div className={`space-y-lg ${className}`}>
      {/* 1. Header Bar with Formations */}
      <div className="flex items-center justify-between p-md rounded-2xl border border-outline-variant/15 bg-surface-container shadow-sm">
        <TeamHeaderBadge
          name={homeName}
          formation={homeFormation}
          logo={homeLogo}
          isHome={true}
        />

        <div className="hidden sm:flex flex-col items-center justify-center px-4">
          <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
            Formações
          </span>
          <span className="text-sm font-bold text-primary mt-0.5">
            {homeFormation} vs {awayFormation}
          </span>
        </div>

        <TeamHeaderBadge
          name={awayName}
          formation={awayFormation}
          logo={awayLogo}
          isHome={false}
        />
      </div>

      {/* 2. Unified Single Pitch (BolaYetuPitchField) */}
      {hasStarters ? (
        <Card variant="flat" padding="none" className="overflow-hidden border border-outline-variant/20 shadow-md">
          <BolaYetuPitchField
            homeStarters={homeStarters}
            awayStarters={awayStarters}
            homeFormation={homeFormation}
            awayFormation={awayFormation}
            homeTeamName={homeName}
            awayTeamName={awayName}
            events={events}
            activePlayerId={activePlayer?.id || activePlayer?.playerId || activePlayer?.player_id}
            onPlayerClick={(player) => setActivePlayer(player)}
          />
        </Card>
      ) : (
        <Card variant="flat" padding="lg">
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <Users className="h-12 w-12 text-on-surface-variant/30 mb-sm" />
            <h3 className="text-base font-bold text-on-surface">Escalações ainda não submetidas</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md">
              Os clubes ainda não registaram os 11 titulares para esta partida. A prancheta será preenchida assim que forem submetidas.
            </p>
          </div>
        </Card>
      )}

      {/* 3. Referee & Coaches Section (SofaScore middle band) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {/* Referee */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-md flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Árbitro da Partida
              </span>
              <span className="text-xs font-bold text-on-surface">
                {match.refereeName || (match as any).referee_name || 'Não designado'}
              </span>
            </div>
          </div>
        </div>

        {/* Coaches */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-md flex items-center justify-between">
          <div className="flex items-center gap-sm w-full justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Treinador ({homeName})
              </span>
              <span className="text-xs font-bold text-on-surface truncate block max-w-[120px]">
                {homeCoach || '—'}
              </span>
            </div>

            <div className="h-6 w-px bg-outline-variant/20 mx-2" />

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Treinador ({awayName})
              </span>
              <span className="text-xs font-bold text-on-surface truncate block max-w-[120px]">
                {awayCoach || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Substitutes Section (2 Parallel Columns - SofaScore style) */}
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-lg space-y-md">
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-sm">
          <div className="flex items-center gap-sm">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">Substituições e Suplentes</h3>
          </div>
          <span className="text-xs text-on-surface-variant">Banco de Reservas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Home Substitutes */}
          <div className="space-y-xs">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              {homeName} ({homeSubs.length})
            </h4>
            {homeSubs.length > 0 ? (
              homeSubs.map(p => (
                <SubstituteItem
                  key={p.id || p.playerId || p.player_id}
                  player={p}
                  events={events}
                  isHome={true}
                />
              ))
            ) : (
              <p className="text-xs text-on-surface-variant/60 py-2 italic">Nenhum suplente registado.</p>
            )}
          </div>

          {/* Away Substitutes */}
          <div className="space-y-xs">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 text-right">
              {awayName} ({awaySubs.length})
            </h4>
            {awaySubs.length > 0 ? (
              awaySubs.map(p => (
                <SubstituteItem
                  key={p.id || p.playerId || p.player_id}
                  player={p}
                  events={events}
                  isHome={false}
                />
              ))
            ) : (
              <p className="text-xs text-on-surface-variant/60 py-2 italic text-right">Nenhum suplente registado.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Lineup Review / Confirmation Action for Organization Operators */}
      {canReviewLineups && (
        <div className="flex flex-wrap gap-sm justify-end p-md rounded-xl border border-primary/20 bg-primary/5">
          {homeLineup && String(homeLineup.status).toLowerCase() === 'submitted' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onConfirmLineup?.(homeLineup.club)}
              disabled={onConfirmPending}
            >
              {onConfirmPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Aprovar Escalação de {homeName}
            </Button>
          )}

          {awayLineup && String(awayLineup.status).toLowerCase() === 'submitted' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onConfirmLineup?.(awayLineup.club)}
              disabled={onConfirmPending}
            >
              {onConfirmPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Aprovar Escalação de {awayName}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
