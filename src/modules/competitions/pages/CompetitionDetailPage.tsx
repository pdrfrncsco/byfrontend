import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Trophy, Activity, Calendar, Loader2,
  BarChart3, CheckCircle2, Clock, XCircle, Pause, Zap
} from 'lucide-react'
import { useCompetitionMatches, useCompetitionStandings, useUpdateMatchScore } from '../hooks/useCompetitionPhase3'
import type { Match, Standing } from '../types'
import { MatchEventsPanel, PlayerStatsTable } from '../components'

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  scheduled: { icon: Clock, color: '#94a3b8', bg: '#94a3b822' },
  live: { icon: Activity, color: '#f59e0b', bg: '#f59e0b22' },
  finished: { icon: CheckCircle2, color: '#10b981', bg: '#10b98122' },
  postponed: { icon: Pause, color: '#6b7280', bg: '#6b728022' },
  cancelled: { icon: XCircle, color: '#ef4444', bg: '#ef444422' },
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled
  const Icon = cfg.icon
  return (
    <span className="comp-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <Icon size={11} /> {label}
    </span>
  )
}

// ─── Match Row ────────────────────────────────────────────────────────────────
function MatchRow({ match, competitionId, isAdmin }: {
  match: Match
  competitionId: string
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [homeGoals, setHomeGoals] = useState(String(match.home_score ?? ''))
  const [awayGoals, setAwayGoals] = useState(String(match.away_score ?? ''))
  const updateScore = useUpdateMatchScore(competitionId)

  const handleSave = () => {
    updateScore.mutate({
      matchId: match.id,
      homeScore: parseInt(homeGoals),
      awayScore: parseInt(awayGoals),
    })
    setEditing(false)
  }

  const matchDate = new Date(match.match_date)
  const dateStr = matchDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = matchDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`comp-match-row comp-match-row--${match.status}`}>
      {/* Round + Date */}
      <div className="comp-match-row__round">
        <span className="comp-match-row__round-num">R{match.round_number}</span>
        <span className="comp-match-row__date">{dateStr} {timeStr}</span>
        {match.venue && <span className="comp-match-row__venue">{match.venue}</span>}
      </div>

      {/* Teams + Score */}
      <div className="comp-match-row__fixture">
        {/* Home */}
        <div className="comp-match-row__team comp-match-row__team--home">
          {match.home_club_logo && (
            <img src={match.home_club_logo} alt="" className="comp-match-row__club-logo" />
          )}
          <span className="comp-match-row__team-name">{match.home_club_name}</span>
        </div>

        {/* Score */}
        <div className="comp-match-row__score">
          {editing ? (
            <div className="comp-match-row__score-edit">
              <input
                type="number"
                min="0"
                value={homeGoals}
                onChange={e => setHomeGoals(e.target.value)}
                className="comp-score-input"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                value={awayGoals}
                onChange={e => setAwayGoals(e.target.value)}
                className="comp-score-input"
              />
            </div>
          ) : (
            <div className="comp-match-row__score-display">
              {match.home_score !== null ? (
                <span className="comp-match-row__score-value">
                  {match.home_score} — {match.away_score}
                </span>
              ) : (
                <span className="comp-match-row__score-vs">VS</span>
              )}
            </div>
          )}
          <StatusBadge status={match.status} label={match.status_label} />
        </div>

        {/* Away */}
        <div className="comp-match-row__team comp-match-row__team--away">
          <span className="comp-match-row__team-name">{match.away_club_name}</span>
          {match.away_club_logo && (
            <img src={match.away_club_logo} alt="" className="comp-match-row__club-logo" />
          )}
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="comp-match-row__actions">
          {editing ? (
            <>
              <button className="comp-btn comp-btn--primary" onClick={handleSave} disabled={updateScore.isPending}>
                {updateScore.isPending ? <Loader2 size={13} className="spin" /> : 'Guardar'}
              </button>
              <button className="comp-btn comp-btn--ghost" onClick={() => setEditing(false)}>Cancelar</button>
            </>
          ) : (
            <button className="comp-btn comp-btn--ghost" onClick={() => setEditing(true)}>
              Resultado
            </button>
          )}
        </div>
      )}

      {/* Toggler for Match Events (Súmula) */}
      <div className="comp-match-row__events-toggle" style={{ gridColumn: '1 / -1', borderTop: '1px solid #f1f5f9' }}>
        <details>
          <summary style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '12px', color: '#64748b', fontWeight: 500, outline: 'none' }}>
            Ver Súmula de Jogo
          </summary>
          <MatchEventsPanel competitionId={competitionId} match={match} isAdmin={isAdmin} />
        </details>
      </div>
    </div>
  )
}

// ─── Standings Table ──────────────────────────────────────────────────────────
function StandingsTable({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return (
      <div className="comp-empty">
        <BarChart3 size={40} />
        <p>Nenhum clube inscrito ainda.</p>
      </div>
    )
  }

  return (
    <div className="comp-standings-wrapper">
      <table className="comp-standings-table">
        <thead>
          <tr>
            <th className="comp-th comp-th--pos">#</th>
            <th className="comp-th comp-th--club">Clube</th>
            <th className="comp-th">J</th>
            <th className="comp-th">V</th>
            <th className="comp-th">E</th>
            <th className="comp-th">D</th>
            <th className="comp-th">GM</th>
            <th className="comp-th">GS</th>
            <th className="comp-th">DG</th>
            <th className="comp-th comp-th--pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, idx) => (
            <tr key={s.id} className={`comp-standing-row ${idx < 3 ? 'comp-standing-row--top3' : ''}`}>
              <td className="comp-td comp-td--pos">{s.position}</td>
              <td className="comp-td comp-td--club">
                <div className="comp-standing-club">
                  {s.club_logo && <img src={s.club_logo} alt="" className="comp-club-logo-sm" />}
                  <Link to={`/clubs/${s.club}`} className="comp-club-link">
                    {s.club_name}
                  </Link>
                </div>
              </td>
              <td className="comp-td">{s.played}</td>
              <td className="comp-td">{s.won}</td>
              <td className="comp-td">{s.drawn}</td>
              <td className="comp-td">{s.lost}</td>
              <td className="comp-td">{s.goals_for}</td>
              <td className="comp-td">{s.goals_against}</td>
              <td className={`comp-td ${s.goal_difference > 0 ? 'comp-td--positive' : s.goal_difference < 0 ? 'comp-td--negative' : ''}`}>
                {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
              </td>
              <td className="comp-td comp-td--pts">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Matches Tab ──────────────────────────────────────────────────────────────
function MatchesTab({
  competitionId,
  isAdmin,
  onGenerateSchedule,
}: {
  competitionId: string
  isAdmin: boolean
  onGenerateSchedule?: () => void
}) {
  const { data: matches = [], isLoading } = useCompetitionMatches(competitionId)

  // Group by round
  const rounds = (matches as Match[]).reduce<Record<number, Match[]>>((acc, m) => {
    if (!acc[m.round_number]) acc[m.round_number] = []
    acc[m.round_number].push(m)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="comp-loading">
        <Loader2 size={28} className="spin" />
        <span>A carregar jogos...</span>
      </div>
    )
  }

  if (Object.keys(rounds).length === 0) {
    return (
      <div className="comp-empty">
        <Calendar size={40} />
        <p>Calendário ainda não gerado.</p>
        {isAdmin && (
          <button id="comp-generate-btn" className="comp-btn comp-btn--primary" onClick={onGenerateSchedule}>
            <Zap size={14} /> Gerar Calendário
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="comp-matches-list">
      {isAdmin && (
        <div className="comp-matches-actions">
          <button id="comp-regenerate-btn" className="comp-btn comp-btn--outline" onClick={onGenerateSchedule}>
            <Zap size={14} /> Regenerar Calendário
          </button>
        </div>
      )}
      {Object.entries(rounds)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, roundMatches]) => (
          <div key={round} className="comp-round-group">
            <div className="comp-round-header">
              <span>Jornada {round}</span>
            </div>
            {roundMatches.map(m => (
              <MatchRow
                key={m.id}
                match={m}
                competitionId={competitionId}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ))}
    </div>
  )
}

// ─── CompetitionDetailPage (Main) ─────────────────────────────────────────────
export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'stats'>('standings')

  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(id ?? '')

  // TODO: derive isAdmin from auth state/context when available
  const isAdmin = false

  const tabs = [
    { key: 'standings', label: 'Classificação', icon: Trophy },
    { key: 'matches', label: 'Jogos', icon: Calendar },
    { key: 'stats', label: 'Estatísticas', icon: BarChart3 },
  ]

  return (
    <div className="comp-detail-page">
      {/* Tab Navigation */}
      <div className="comp-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              id={`comp-tab-${tab.key}`}
              className={`comp-tab ${active ? 'comp-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'standings' && (
        loadingStandings ? (
          <div className="comp-loading"><Loader2 size={28} className="spin" /> A carregar classificação...</div>
        ) : (
          <StandingsTable standings={standings as Standing[]} />
        )
      )}

      {activeTab === 'matches' && (
        <MatchesTab
          competitionId={id ?? ''}
          isAdmin={isAdmin}
          onGenerateSchedule={() => { /* TODO: open schedule modal */ }}
        />
      )}

      {activeTab === 'stats' && (
        <PlayerStatsTable competitionId={id ?? ''} />
      )}
    </div>
  )
}
