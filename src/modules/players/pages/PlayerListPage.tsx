import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, User, Trophy, Target, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePlayers, usePlayerSearch } from '../hooks'
import { ALL_POSITIONS, POSITION_COLOR, STATUS_COLOR } from '../constants'
import type { Player, PlayerPosition } from '../types'
import { useDebounce } from '@/hooks/useDebounce'

// ─── Position Badge ────────────────────────────────────────────────────────────
function PositionBadge({ position, label }: { position: string; label: string }) {
  const color = POSITION_COLOR[position] ?? '#6b7280'
  return (
    <span
      className="players-position-badge"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {label}
    </span>
  )
}

// ─── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({ player }: { player: Player }) {
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name[0]}${player.last_name[0]}`.toUpperCase()

  return (
    <Link to={`/players/${player.slug}`} className="player-card" id={`player-${player.slug}`}>
      {/* Avatar */}
      <div className="player-card__avatar">
        {player.avatar ? (
          <img src={player.avatar} alt={player.full_name} className="player-card__avatar-img" />
        ) : (
          <span className="player-card__avatar-initials">{initials}</span>
        )}
        <span
          className="player-card__status-dot"
          style={{ background: statusColor }}
          title={player.status_label}
        />
      </div>

      {/* Info */}
      <div className="player-card__info">
        <div className="player-card__name">{player.full_name}</div>
        <div className="player-card__meta">
          {player.nationality && (
            <span className="player-card__nationality">{player.nationality}</span>
          )}
          {player.age && (
            <span className="player-card__age">{player.age} anos</span>
          )}
        </div>
        <PositionBadge position={player.primary_position} label={player.position_label} />
      </div>

      {/* Stats */}
      <div className="player-card__stats">
        <div className="player-card__stat">
          <Trophy size={12} />
          <span>{player.total_goals}</span>
        </div>
        <div className="player-card__stat">
          <Target size={12} />
          <span>{player.total_assists}</span>
        </div>
        <div className="player-card__stat">
          <User size={12} />
          <span>{player.total_matches}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="players-empty">
      <User size={48} className="players-empty__icon" />
      <p>{message}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function PlayerListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition | ''>('')
  const [selectedNationality, setSelectedNationality] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 350)

  const isSearching = debouncedSearch.length >= 2
  const searchResult = usePlayerSearch(debouncedSearch)
  const listResult = usePlayers({
    page,
    position: selectedPosition || undefined,
    nationality: selectedNationality || undefined,
  })

  const activeResult = isSearching ? searchResult : listResult
  const isLoading = activeResult.isLoading

  // Build list of players
  const players: Player[] = isSearching
    ? (searchResult.data?.data ?? [])
    : (listResult.data?.data?.results ?? [])

  const totalCount = isSearching
    ? players.length
    : (listResult.data?.data?.count ?? 0)

  const hasNext = !isSearching && Boolean(listResult.data?.data?.next)
  const hasPrev = !isSearching && Boolean(listResult.data?.data?.previous)

  const handleClearFilters = useCallback(() => {
    setSelectedPosition('')
    setSelectedNationality('')
    setPage(1)
  }, [])

  return (
    <div className="players-page">
      {/* Header */}
      <div className="players-page__header">
        <div>
          <h1 className="players-page__title">Jogadores</h1>
          <p className="players-page__subtitle">
            {totalCount > 0 ? `${totalCount} jogadores encontrados` : 'Plataforma global de jogadores'}
          </p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="players-search-bar">
        <div className="players-search-bar__input-wrapper">
          <Search size={16} className="players-search-bar__icon" />
          <input
            id="players-search-input"
            type="text"
            placeholder="Pesquisar jogador por nome..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
            className="players-search-bar__input"
          />
        </div>
        <button
          id="players-filter-toggle"
          className={`players-filter-btn ${showFilters ? 'players-filter-btn--active' : ''}`}
          onClick={() => setShowFilters(v => !v)}
        >
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="players-filters">
          <div className="players-filters__group">
            <label className="players-filters__label">Posição</label>
            <div className="players-filters__positions">
              <button
                className={`players-position-btn ${selectedPosition === '' ? 'players-position-btn--active' : ''}`}
                onClick={() => { setSelectedPosition(''); setPage(1) }}
              >
                Todas
              </button>
              {ALL_POSITIONS.filter(p => p.value !== 'multiple').map(pos => (
                <button
                  key={pos.value}
                  className={`players-position-btn ${selectedPosition === pos.value ? 'players-position-btn--active' : ''}`}
                  style={selectedPosition === pos.value
                    ? { background: `${POSITION_COLOR[pos.value]}33`, borderColor: POSITION_COLOR[pos.value], color: POSITION_COLOR[pos.value] }
                    : {}}
                  onClick={() => { setSelectedPosition(pos.value as PlayerPosition); setPage(1) }}
                  title={pos.fullLabel}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
          <div className="players-filters__group">
            <label className="players-filters__label" htmlFor="nationality-filter">Nacionalidade</label>
            <input
              id="nationality-filter"
              type="text"
              placeholder="ex: AO, PT, BR..."
              value={selectedNationality}
              onChange={e => { setSelectedNationality(e.target.value.toUpperCase()); setPage(1) }}
              maxLength={3}
              className="players-filters__nationality-input"
            />
          </div>
          {(selectedPosition || selectedNationality) && (
            <button id="players-clear-filters" className="players-clear-btn" onClick={handleClearFilters}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="players-loading">
          <Loader2 size={32} className="players-loading__spinner" />
          <span>A carregar jogadores...</span>
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          message={
            isSearching
              ? `Sem resultados para "${debouncedSearch}"`
              : 'Nenhum jogador encontrado com os filtros seleccionados.'
          }
        />
      ) : (
        <div className="players-grid">
          {players.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Pagination (list mode only) */}
      {!isSearching && (hasPrev || hasNext) && (
        <div className="players-pagination">
          <button
            id="players-page-prev"
            className="players-pagination__btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!hasPrev}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="players-pagination__info">Página {page}</span>
          <button
            id="players-page-next"
            className="players-pagination__btn"
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNext}
          >
            Seguinte <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
