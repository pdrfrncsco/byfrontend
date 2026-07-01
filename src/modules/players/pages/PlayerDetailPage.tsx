import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, MapPin, Ruler, Weight, Activity,
  Trophy, Target, Calendar, Loader2, AlertCircle, Star, Clock
} from 'lucide-react'
import { usePlayer } from '../hooks'
import { POSITION_COLOR, STATUS_COLOR } from '../constants'
import type { PlayerCareerEntry } from '../types'

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ size?: string | number; className?: string }>
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="player-stat-card">
      <div className="player-stat-card__icon" style={color ? { color, background: `${color}1a` } : {}}>
        <Icon size={18} />
      </div>
      <div className="player-stat-card__body">
        <span className="player-stat-card__value">{value}</span>
        <span className="player-stat-card__label">{label}</span>
      </div>
    </div>
  )
}

// ─── Career Timeline ──────────────────────────────────────────────────────────
function CareerTimeline({ career }: { career: PlayerCareerEntry[] }) {
  if (career.length === 0) {
    return (
      <div className="player-career-empty">
        <Clock size={28} />
        <p>Sem registos de carreira disponíveis.</p>
      </div>
    )
  }

  return (
    <div className="player-career-timeline">
      {career.map((entry, i) => (
        <div key={i} className="player-career-entry">
          <div className="player-career-entry__line">
            <div className="player-career-entry__dot" />
            {i < career.length - 1 && <div className="player-career-entry__connector" />}
          </div>
          <div className="player-career-entry__content">
            <div className="player-career-entry__header">
              <Link to={`/clubs/${entry.club_slug}`} className="player-career-entry__club">
                {entry.club}
              </Link>
              <span className={`player-career-entry__status player-career-entry__status--${entry.status.toLowerCase()}`}>
                {entry.status}
              </span>
            </div>
            <div className="player-career-entry__dates">
              <Calendar size={12} />
              {new Date(entry.joined).getFullYear()}
              {entry.left ? ` → ${new Date(entry.left).getFullYear()}` : ' → Presente'}
            </div>
            <div className="player-career-entry__stats">
              <span><Trophy size={11} /> {entry.goals} golos</span>
              <span><Target size={11} /> {entry.assists} ass.</span>
              <span><Activity size={11} /> {entry.matches} jogos</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function PlayerDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = usePlayer(slug ?? '')

  if (isLoading) {
    return (
      <div className="players-page players-page--loading">
        <Loader2 size={40} className="players-loading__spinner" />
        <span>A carregar perfil do jogador...</span>
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="players-page players-page--error">
        <AlertCircle size={40} />
        <h2>Jogador não encontrado</h2>
        <p>O jogador que procura não existe ou foi removido.</p>
        <button id="player-detail-back-btn" className="btn btn--primary" onClick={() => navigate('/players')}>
          Voltar aos jogadores
        </button>
      </div>
    )
  }

  const player = data.data
  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name[0]}${player.last_name[0]}`.toUpperCase()

  return (
    <div className="player-detail-page">
      {/* Back Navigation */}
      <Link to="/players" className="player-detail-back" id="player-back-link">
        <ArrowLeft size={16} />
        Todos os jogadores
      </Link>

      {/* Hero Section */}
      <div className="player-hero">
        {/* Avatar */}
        <div className="player-hero__avatar-wrapper">
          <div className="player-hero__avatar" style={{ borderColor: positionColor }}>
            {player.avatar ? (
              <img src={player.avatar} alt={player.full_name} className="player-hero__avatar-img" />
            ) : (
              <span className="player-hero__avatar-initials" style={{ color: positionColor }}>
                {initials}
              </span>
            )}
          </div>
          <span
            className="player-hero__position-badge"
            style={{ background: `${positionColor}22`, color: positionColor, border: `1.5px solid ${positionColor}` }}
          >
            {player.position_label}
          </span>
        </div>

        {/* Identity */}
        <div className="player-hero__identity">
          <div className="player-hero__name-row">
            <h1 className="player-hero__name" id="player-detail-name">{player.full_name}</h1>
            <span
              className="player-hero__status"
              style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}
            >
              {player.status_label}
            </span>
          </div>

          {/* Current Club */}
          {player.current_club && (
            <Link
              to={`/clubs/${player.current_club.slug}`}
              className="player-hero__current-club"
              id="player-current-club-link"
            >
              <Star size={14} />
              {player.current_club.name}
              {player.current_club.shirt_number && (
                <span className="player-hero__shirt-number">#{player.current_club.shirt_number}</span>
              )}
            </Link>
          )}

          {/* Physical Info */}
          <div className="player-hero__attrs">
            {player.nationality && (
              <div className="player-hero__attr">
                <MapPin size={14} />
                {player.nationality}
              </div>
            )}
            {player.age && (
              <div className="player-hero__attr">
                <Calendar size={14} />
                {player.age} anos
              </div>
            )}
            {player.height_cm && (
              <div className="player-hero__attr">
                <Ruler size={14} />
                {player.height_cm} cm
              </div>
            )}
            {player.weight_kg && (
              <div className="player-hero__attr">
                <Weight size={14} />
                {player.weight_kg} kg
              </div>
            )}
            {player.foot && (
              <div className="player-hero__attr">
                <Activity size={14} />
                Pé {player.foot === 'left' ? 'esquerdo' : player.foot === 'right' ? 'direito' : 'ambos'}
              </div>
            )}
          </div>

          {/* Bio */}
          {player.bio && (
            <p className="player-hero__bio">{player.bio}</p>
          )}
        </div>
      </div>

      {/* Career Stats */}
      <div className="player-detail-section">
        <h2 className="player-detail-section__title">Estatísticas de Carreira</h2>
        <div className="player-stats-grid">
          <StatCard icon={Activity} label="Jogos" value={player.total_matches} />
          <StatCard icon={Trophy} label="Golos" value={player.total_goals} color="#f59e0b" />
          <StatCard icon={Target} label="Assistências" value={player.total_assists} color="#10b981" />
          <StatCard icon={User} label="Posição" value={player.position_label} color={positionColor} />
        </div>
      </div>

      {/* Career History */}
      <div className="player-detail-section">
        <h2 className="player-detail-section__title">Histórico de Carreira</h2>
        <CareerTimeline career={player.career_history ?? []} />
      </div>
    </div>
  )
}
