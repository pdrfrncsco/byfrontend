import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Goal,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react'
import { Button, Input, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useSubmitManualScoresheet } from '../hooks/useCompetitionMatches'
import { useMatchPlayers, type MatchSelectablePlayer } from '../hooks/useMatchPlayers'
import type { Match } from '../types'

interface GoalEntry {
  id: string
  club_id: string
  player_id?: string
  assist_player_id?: string
  custom_name?: string
  minute: number
  event_type: 'goal' | 'penalty_scored' | 'own_goal'
  notes?: string
}

interface CardEntry {
  id: string
  club_id: string
  player_id?: string
  custom_name?: string
  minute: number
  event_type: 'yellow_card' | 'red_card' | 'yellow_red'
  notes?: string
}

interface SubstitutionEntry {
  id: string
  club_id: string
  player_id?: string // Entra (In)
  player_off_id?: string // Sai (Out)
  minute: number
  notes?: string
}

interface ManualMatchScoresheetModalProps {
  competitionId: string
  match: Match | null
  isOpen: boolean
  onClose: () => void
}

export function ManualMatchScoresheetModal({
  competitionId,
  match,
  isOpen,
  onClose,
}: ManualMatchScoresheetModalProps) {
  const submitScoresheet = useSubmitManualScoresheet(competitionId)

  const homeClubId = match?.home_club || match?.homeTeamId || ''
  const awayClubId = match?.away_club || match?.awayTeamId || ''

  const { getPlayersForClub, getStartersForClub, getSubstitutesForClub, isLoading: loadingPlayers } =
    useMatchPlayers(match?.id, homeClubId, awayClubId)

  const [activeTab, setActiveTab] = useState<'score' | 'goals' | 'cards' | 'subs' | 'notes'>('score')
  const [homeScore, setHomeScore] = useState<number>(0)
  const [awayScore, setAwayScore] = useState<number>(0)
  const [status, setStatus] = useState<string>('finished')
  const [homePenaltyScore, setHomePenaltyScore] = useState<string>('')
  const [awayPenaltyScore, setAwayPenaltyScore] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true)

  const [goals, setGoals] = useState<GoalEntry[]>([])
  const [cards, setCards] = useState<CardEntry[]>([])
  const [substitutions, setSubstitutions] = useState<SubstitutionEntry[]>([])

  useEffect(() => {
    if (isOpen && match) {
      setHomeScore(match.home_score ?? 0)
      setAwayScore(match.away_score ?? 0)
      setStatus(match.status === 'scheduled' ? 'finished' : match.status)
      setHomePenaltyScore(match.home_penalty_score != null ? String(match.home_penalty_score) : '')
      setAwayPenaltyScore(match.away_penalty_score != null ? String(match.away_penalty_score) : '')
      setGoals([])
      setCards([])
      setSubstitutions([])
      setNotes('')
      setActiveTab('score')
    }
  }, [isOpen])

  if (!isOpen || !match) return null

  const handleAddGoal = (defaultClubId: string) => {
    setGoals((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        club_id: defaultClubId,
        minute: 45,
        event_type: 'goal',
        player_id: '',
        assist_player_id: '',
        notes: '',
      },
    ])
    setActiveTab('goals')
  }

  const handleRemoveGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const handleUpdateGoal = (id: string, field: keyof GoalEntry, value: any) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    )
  }

  const handleAddCard = (defaultClubId: string) => {
    setCards((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        club_id: defaultClubId,
        minute: 60,
        event_type: 'yellow_card',
        player_id: '',
        notes: '',
      },
    ])
    setActiveTab('cards')
  }

  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const handleUpdateCard = (id: string, field: keyof CardEntry, value: any) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const handleAddSubstitution = (defaultClubId: string) => {
    setSubstitutions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        club_id: defaultClubId,
        minute: 60,
        player_id: '',
        player_off_id: '',
        notes: '',
      },
    ])
    setActiveTab('subs')
  }

  const handleRemoveSubstitution = (id: string) => {
    setSubstitutions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleUpdateSubstitution = (id: string, field: keyof SubstitutionEntry, value: any) => {
    setSubstitutions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const preparedGoals = goals.map((g) => {
      const isCustom = g.player_id === 'custom'
      const isOwnGoal = g.event_type === 'own_goal' || g.player_id === 'own_goal'
      const resolvedPlayerId = !isCustom && !isOwnGoal && g.player_id ? g.player_id : null
      const resolvedNotes = isCustom ? g.custom_name || g.notes : g.notes || undefined

      return {
        club_id: g.club_id,
        player_id: resolvedPlayerId,
        assist_player_id: g.assist_player_id && g.assist_player_id !== '' ? g.assist_player_id : null,
        minute: Number(g.minute) || 1,
        event_type: g.event_type,
        notes: resolvedNotes,
      }
    })

    const preparedCards = cards.map((c) => {
      const isCustom = c.player_id === 'custom'
      const resolvedPlayerId = !isCustom && c.player_id ? c.player_id : null
      const resolvedNotes = isCustom ? c.custom_name || c.notes : c.notes || undefined

      return {
        club_id: c.club_id,
        player_id: resolvedPlayerId,
        minute: Number(c.minute) || 1,
        event_type: c.event_type,
        notes: resolvedNotes,
      }
    })

    const preparedSubs = substitutions.map((s) => ({
      club_id: s.club_id,
      player_id: s.player_id || null,
      player_off_id: s.player_off_id || null,
      minute: Number(s.minute) || 46,
      notes: s.notes || undefined,
    }))

    submitScoresheet.mutate(
      {
        matchId: match.id,
        data: {
          home_score: Number(homeScore),
          away_score: Number(awayScore),
          status,
          home_penalty_score: homePenaltyScore !== '' ? Number(homePenaltyScore) : null,
          away_penalty_score: awayPenaltyScore !== '' ? Number(awayPenaltyScore) : null,
          goals: preparedGoals,
          cards: preparedCards,
          substitutions: preparedSubs,
          notes: notes || undefined,
          replace_existing_events: replaceExisting,
        },
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const renderPlayerOptions = (clubId: string, currentSelectedId?: string) => {
    const players = getPlayersForClub(clubId)
    const starters = players.filter((p) => p.status === 'starter')
    const subs = players.filter((p) => p.status === 'substitute')
    const squadOthers = players.filter((p) => p.status === 'squad')

    return (
      <>
        <option value="">Selecione o jogador...</option>
        {starters.length > 0 && (
          <optgroup label="Titulares">
            {starters.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.number ?? '-'} {p.name} ({p.position ?? 'Jogador'})
              </option>
            ))}
          </optgroup>
        )}
        {subs.length > 0 && (
          <optgroup label="Suplentes">
            {subs.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.number ?? '-'} {p.name} ({p.position ?? 'Jogador'})
              </option>
            ))}
          </optgroup>
        )}
        {squadOthers.length > 0 && (
          <optgroup label="Outros do Plantel">
            {squadOthers.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.number ?? '-'} {p.name} ({p.position ?? 'Jogador'})
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Opções Especiais">
          <option value="custom">Outro / Não listado (Digitar nome)</option>
        </optgroup>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl space-y-md max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-sm">
          <div className="flex items-center gap-xs">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-on-surface">
                Ficha de Jogo Manual (Súmula)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Registo pós-jogo de placar, marcadores, cartões e substituições
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Header da Partida & Placar Rápido */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-md text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-xs">
              {match.round_name || `Jornada ${match.round_number}`}
            </p>
            <div className="grid grid-cols-7 items-center gap-sm">
              <div className="col-span-3 text-right">
                <span className="text-sm font-bold text-on-surface block truncate">
                  {match.home_club_name}
                </span>
                <span className="text-[11px] text-on-surface-variant">Equipa Visitada</span>
              </div>

              <div className="col-span-1 flex items-center justify-center gap-xs">
                <Input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-11 w-12 text-center text-lg font-black"
                />
                <span className="text-lg font-black text-on-surface-variant">-</span>
                <Input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-11 w-12 text-center text-lg font-black"
                />
              </div>

              <div className="col-span-3 text-left">
                <span className="text-sm font-bold text-on-surface block truncate">
                  {match.away_club_name}
                </span>
                <span className="text-[11px] text-on-surface-variant">Equipa Visitante</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-xs border-b border-outline-variant/15 pb-xs">
            <button
              type="button"
              onClick={() => setActiveTab('score')}
              className={`rounded-lg px-sm py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'score'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Definições & Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-1 rounded-lg px-sm py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'goals'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Goal className="h-3.5 w-3.5" />
              <span>Golos</span>
              <span className="ml-0.5 rounded-full bg-surface/30 px-1 text-[10px]">
                {goals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1 rounded-lg px-sm py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'cards'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Cartões</span>
              <span className="ml-0.5 rounded-full bg-surface/30 px-1 text-[10px]">
                {cards.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subs')}
              className={`flex items-center gap-1 rounded-lg px-sm py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'subs'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Substituições</span>
              <span className="ml-0.5 rounded-full bg-surface/30 px-1 text-[10px]">
                {substitutions.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`rounded-lg px-sm py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'notes'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Observações
            </button>
          </div>

          {/* Tab Content: Definições & Status */}
          {activeTab === 'score' && (
            <div className="space-y-md py-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Status Final da Partida
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-sm py-2 text-sm text-on-surface"
                  >
                    <option value="finished">Terminado (Finished)</option>
                    <option value="cancelled">Cancelado (Cancelled)</option>
                    <option value="postponed">Adiado (Postponed)</option>
                    <option value="suspended">Suspenso (Suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Desempate por Penáltis (Se houver)
                  </label>
                  <div className="flex items-center gap-xs">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Casa"
                      value={homePenaltyScore}
                      onChange={(e) => setHomePenaltyScore(e.target.value)}
                      className="h-9 text-xs text-center"
                    />
                    <span className="text-xs font-bold text-on-surface-variant">x</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Fora"
                      value={awayPenaltyScore}
                      onChange={(e) => setAwayPenaltyScore(e.target.value)}
                      className="h-9 text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface">Substituir eventos anteriores</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Limpa e regrava os eventos existentes para garantir a sincronização fiel com a súmula física.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary"
                />
              </div>

              <div className="flex gap-sm justify-end pt-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddGoal(match.home_club)}
                >
                  <Plus className="mr-xs h-3.5 w-3.5" /> Adicionar Golo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCard(match.home_club)}
                >
                  <Plus className="mr-xs h-3.5 w-3.5" /> Adicionar Cartão
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSubstitution(match.home_club)}
                >
                  <Plus className="mr-xs h-3.5 w-3.5" /> Adicionar Substituição
                </Button>
              </div>
            </div>
          )}

          {/* Tab Content: Golos */}
          {activeTab === 'goals' && (
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Registo de Marcadores de Golo
                </h4>
                <div className="flex gap-xs">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddGoal(match.home_club)}
                  >
                    <Plus className="mr-xs h-3 w-3" /> + Golo ({match.home_club_name.slice(0, 10)})
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddGoal(match.away_club)}
                  >
                    <Plus className="mr-xs h-3 w-3" /> + Golo ({match.away_club_name.slice(0, 10)})
                  </Button>
                </div>
              </div>

              {goals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant/30 p-lg text-center">
                  <Goal className="mx-auto h-8 w-8 text-on-surface-variant/30" />
                  <p className="mt-xs text-xs font-medium text-on-surface-variant">
                    Nenhum golo adicionado. Se o jogo terminou 0-0, avance diretamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-xs">
                  {goals.map((g, idx) => {
                    const isCustom = g.player_id === 'custom'
                    const isOwnGoal = g.event_type === 'own_goal'

                    return (
                      <div
                        key={g.id}
                        className="p-sm rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-xs"
                      >
                        <div className="grid grid-cols-12 gap-xs items-center text-xs">
                          {/* Equipa */}
                          <div className="col-span-3">
                            <select
                              value={g.club_id}
                              onChange={(e) => {
                                handleUpdateGoal(g.id, 'club_id', e.target.value)
                                handleUpdateGoal(g.id, 'player_id', '')
                              }}
                              className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium"
                            >
                              <option value={match.home_club}>{match.home_club_name}</option>
                              <option value={match.away_club}>{match.away_club_name}</option>
                            </select>
                          </div>

                          {/* Minuto */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                max="130"
                                value={g.minute}
                                onChange={(e) => handleUpdateGoal(g.id, 'minute', e.target.value)}
                                className="h-8 text-xs text-center"
                              />
                              <span className="text-on-surface-variant font-medium">min</span>
                            </div>
                          </div>

                          {/* Tipo de Golo */}
                          <div className="col-span-3">
                            <select
                              value={g.event_type}
                              onChange={(e) => handleUpdateGoal(g.id, 'event_type', e.target.value)}
                              className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5"
                            >
                              <option value="goal">⚽ Golo Regular</option>
                              <option value="penalty_scored">🎯 Penálti</option>
                              <option value="own_goal">🔴 Auto-golo</option>
                            </select>
                          </div>

                          {/* Jogador Marcador */}
                          <div className="col-span-3">
                            <select
                              value={g.player_id || ''}
                              onChange={(e) => handleUpdateGoal(g.id, 'player_id', e.target.value)}
                              className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium text-on-surface"
                            >
                              {renderPlayerOptions(g.club_id, g.player_id)}
                            </select>
                          </div>

                          {/* Botão Remover */}
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveGoal(g.id)}
                              className="text-error hover:opacity-80 p-1.5 rounded-md hover:bg-error/10 transition-colors"
                              title="Remover golo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Assistência (apenas para golos regulares e penáltis) */}
                        {g.event_type !== 'own_goal' && (
                          <div className="pl-xs pt-xs flex items-center gap-xs">
                            <span className="text-[11px] text-on-surface-variant font-semibold whitespace-nowrap">Assistência:</span>
                            <select
                              value={g.assist_player_id || ''}
                              onChange={(e) => handleUpdateGoal(g.id, 'assist_player_id' as any, e.target.value)}
                              className="flex-1 max-w-sm text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 text-on-surface"
                            >
                              <option value="">Sem assistência</option>
                              {(() => {
                                const players = getPlayersForClub(g.club_id)
                                const starterPlayers = players.filter((p) => p.status === 'starter')
                                const subPlayers = players.filter((p) => p.status === 'substitute')
                                const otherPlayers = players.filter((p) => p.status !== 'starter' && p.status !== 'substitute')
                                return (
                                  <>
                                    {starterPlayers.length > 0 && (
                                      <optgroup label="Titulares">
                                        {starterPlayers.filter(p => p.id !== g.player_id).map((p) => (
                                          <option key={p.id} value={p.id}>
                                            #{p.number ?? '-'} {p.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    )}
                                    {subPlayers.length > 0 && (
                                      <optgroup label="Suplentes">
                                        {subPlayers.filter(p => p.id !== g.player_id).map((p) => (
                                          <option key={p.id} value={p.id}>
                                            #{p.number ?? '-'} {p.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    )}
                                    {otherPlayers.length > 0 && (
                                      <optgroup label="Outros">
                                        {otherPlayers.filter(p => p.id !== g.player_id).map((p) => (
                                          <option key={p.id} value={p.id}>
                                            #{p.number ?? '-'} {p.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    )}
                                  </>
                                )
                              })()}
                            </select>
                          </div>
                        )}

                        {/* Campo extra se for "Outro / Não listado" ou auto-golo */}
                        {isCustom && (
                          <div className="pl-xs pt-xs flex items-center gap-xs">
                            <span className="text-[11px] text-primary font-semibold">Nome do Atleta:</span>
                            <Input
                              type="text"
                              placeholder="Digite o nome completo do marcador..."
                              value={g.custom_name || ''}
                              onChange={(e) => handleUpdateGoal(g.id, 'custom_name', e.target.value)}
                              className="h-7 text-xs flex-1 max-w-sm"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Cartões */}
          {activeTab === 'cards' && (
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Registo Disciplinar (Cartões)
                </h4>
                <div className="flex gap-xs">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddCard(match.home_club)}
                  >
                    <Plus className="mr-xs h-3 w-3" /> + Cartão ({match.home_club_name.slice(0, 10)})
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddCard(match.away_club)}
                  >
                    <Plus className="mr-xs h-3 w-3" /> + Cartão ({match.away_club_name.slice(0, 10)})
                  </Button>
                </div>
              </div>

              {cards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant/30 p-lg text-center">
                  <ShieldAlert className="mx-auto h-8 w-8 text-on-surface-variant/30" />
                  <p className="mt-xs text-xs font-medium text-on-surface-variant">
                    Nenhum cartão disciplinar registado.
                  </p>
                </div>
              ) : (
                <div className="space-y-xs">
                  {cards.map((c) => {
                    const isCustom = c.player_id === 'custom'

                    return (
                      <div
                        key={c.id}
                        className="p-sm rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-xs"
                      >
                        <div className="grid grid-cols-12 gap-xs items-center text-xs">
                          {/* Equipa */}
                          <div className="col-span-3">
                            <select
                              value={c.club_id}
                              onChange={(e) => {
                                handleUpdateCard(c.id, 'club_id', e.target.value)
                                handleUpdateCard(c.id, 'player_id', '')
                              }}
                              className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium"
                            >
                              <option value={match.home_club}>{match.home_club_name}</option>
                              <option value={match.away_club}>{match.away_club_name}</option>
                            </select>
                          </div>

                          {/* Minuto */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                max="130"
                                value={c.minute}
                                onChange={(e) => handleUpdateCard(c.id, 'minute', e.target.value)}
                                className="h-8 text-xs text-center"
                              />
                              <span className="text-on-surface-variant font-medium">min</span>
                            </div>
                          </div>

                          {/* Tipo de Cartão */}
                          <div className="col-span-3">
                            <select
                              value={c.event_type}
                              onChange={(e) => handleUpdateCard(c.id, 'event_type', e.target.value)}
                              className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-semibold"
                            >
                              <option value="yellow_card" className="text-amber-600">🟨 Cartão Amarelo</option>
                              <option value="red_card" className="text-red-600">🟥 Vermelho Direto</option>
                              <option value="yellow_red" className="text-orange-600">🟧 2º Amarelo (Vermelho)</option>
                            </select>
                          </div>

                          {/* Jogador Sancionado */}
                          <div className="col-span-3">
                            <select
                              value={c.player_id || ''}
                              onChange={(e) => handleUpdateCard(c.id, 'player_id', e.target.value)}
                              className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium text-on-surface"
                            >
                              {renderPlayerOptions(c.club_id, c.player_id)}
                            </select>
                          </div>

                          {/* Botão Remover */}
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveCard(c.id)}
                              className="text-error hover:opacity-80 p-1.5 rounded-md hover:bg-error/10 transition-colors"
                              title="Remover cartão"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Campo extra se for "Outro / Não listado" */}
                        {isCustom && (
                          <div className="pl-xs pt-xs flex items-center gap-xs">
                            <span className="text-[11px] text-primary font-semibold">Nome do Atleta:</span>
                            <Input
                              type="text"
                              placeholder="Digite o nome completo do jogador advertido..."
                              value={c.custom_name || ''}
                              onChange={(e) => handleUpdateCard(c.id, 'custom_name', e.target.value)}
                              className="h-7 text-xs flex-1 max-w-sm"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Substituições */}
          {activeTab === 'subs' && (
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Registo de Substituições
                </h4>
                <div className="flex gap-xs">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddSubstitution(match.home_club)}
                  >
                    <Plus className="mr-xs h-3 w-3" /> + Subs ({match.home_club_name.slice(0, 10)})
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddSubstitution(match.away_club)}
                  >
                    <Plus className="mr-xs h-3 w-3" /> + Subs ({match.away_club_name.slice(0, 10)})
                  </Button>
                </div>
              </div>

              {substitutions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant/30 p-lg text-center">
                  <ArrowRightLeft className="mx-auto h-8 w-8 text-on-surface-variant/30" />
                  <p className="mt-xs text-xs font-medium text-on-surface-variant">
                    Nenhuma substituição registada.
                  </p>
                </div>
              ) : (
                <div className="space-y-xs">
                  {substitutions.map((s) => (
                    <div
                      key={s.id}
                      className="p-sm rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-xs"
                    >
                      <div className="grid grid-cols-12 gap-xs items-center text-xs">
                        {/* Equipa */}
                        <div className="col-span-2">
                          <select
                            value={s.club_id}
                            onChange={(e) => {
                              handleUpdateSubstitution(s.id, 'club_id', e.target.value)
                              handleUpdateSubstitution(s.id, 'player_id', '')
                              handleUpdateSubstitution(s.id, 'player_off_id', '')
                            }}
                            className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium"
                          >
                            <option value={match.home_club}>{match.home_club_name}</option>
                            <option value={match.away_club}>{match.away_club_name}</option>
                          </select>
                        </div>

                        {/* Minuto */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="1"
                              max="130"
                              value={s.minute}
                              onChange={(e) => handleUpdateSubstitution(s.id, 'minute', e.target.value)}
                              className="h-8 text-xs text-center"
                            />
                            <span className="text-on-surface-variant font-medium">min</span>
                          </div>
                        </div>

                        {/* Sai (Off) */}
                        <div className="col-span-3">
                          <label className="block text-[10px] text-error font-semibold mb-0.5">
                            Sai (Campo):
                          </label>
                          <select
                            value={s.player_off_id || ''}
                            onChange={(e) => handleUpdateSubstitution(s.id, 'player_off_id', e.target.value)}
                            className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium text-on-surface"
                          >
                            {renderPlayerOptions(s.club_id, s.player_off_id)}
                          </select>
                        </div>

                        {/* Entra (In) */}
                        <div className="col-span-4">
                          <label className="block text-[10px] text-emerald-600 font-semibold mb-0.5">
                            Entra (Banco):
                          </label>
                          <select
                            value={s.player_id || ''}
                            onChange={(e) => handleUpdateSubstitution(s.id, 'player_id', e.target.value)}
                            className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface p-1.5 font-medium text-on-surface"
                          >
                            {renderPlayerOptions(s.club_id, s.player_id)}
                          </select>
                        </div>

                        {/* Botão Remover */}
                        <div className="col-span-1 text-center pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveSubstitution(s.id)}
                            className="text-error hover:opacity-80 p-1.5 rounded-md hover:bg-error/10 transition-colors"
                            title="Remover substituição"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Observações */}
          {activeTab === 'notes' && (
            <div className="space-y-xs">
              <label className="block text-xs font-semibold text-on-surface">
                Observações do Relatório / Incidências
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: Jogo decorreu com normalidade; atraso de 10 min por motivo de iluminação..."
                rows={4}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface p-md text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between border-t border-outline-variant/15 pt-md">
            <p className="text-[11px] text-on-surface-variant">
              Total: {goals.length} golo(s), {cards.length} cartão(ões), {substitutions.length} subs.
            </p>
            <div className="flex gap-sm">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitScoresheet.isPending}
              >
                {submitScoresheet.isPending ? (
                  <>
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                    A guardar súmula...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-xs h-4 w-4" />
                    Gravar Súmula e Resultados
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
