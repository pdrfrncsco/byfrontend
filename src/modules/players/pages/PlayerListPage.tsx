import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Scale, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { ErrorState, EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { SearchToolbar } from '@/modules/shared/components'
import { SportListLayout } from '@/modules/shared/components/sport'
import { PlayerCardCompact } from '../components'
import { usePlayers } from '../hooks'
import { ALL_POSITIONS, POSITION_COLOR } from '../constants'
import { playerRoutes } from '../routes'
import type { Player, PlayerPosition } from '../types'

export function PlayerListPage() {
  const { t } = useTranslation()
  useSeo({
    title: 'Jogadores',
    description: 'Descubra jogadores, talentos e perfis públicos do futebol em Angola e África.',
    path: '/players',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition | ''>('')
  const [selectedNationality, setSelectedNationality] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 350)
  const isSearching = debouncedSearch.length >= 2

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedPosition, selectedNationality, showOnlyAvailable])

  const listResult = usePlayers({
    page,
    page_size: 15,
    search: isSearching ? debouncedSearch : undefined,
    position: selectedPosition || undefined,
    nationality: selectedNationality || undefined,
    without_club: showOnlyAvailable || undefined,
  })

  const isLoading = listResult.isLoading
  const isError = listResult.isError
  const players: Player[] = listResult.data?.results ?? []
  const totalCount = listResult.data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / 15))
  const activeFilters = useMemo(
    () => [selectedPosition, selectedNationality, showOnlyAvailable ? 'available' : ''].filter(Boolean).length,
    [selectedPosition, selectedNationality, showOnlyAvailable]
  )

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedPosition('')
    setSelectedNationality('')
    setShowOnlyAvailable(false)
    setPage(1)
  }, [])

  return (
    <SportListLayout
      breadcrumb={
        <div className="flex items-center gap-xs">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">Jogadores</span>
        </div>
      }
      title="Jogadores"
      count={totalCount}
      filters={
        <div className="space-y-sm">
          <SearchToolbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('players.list.searchPlaceholder')}
            actions={
              <div className="flex items-center gap-xs">
                <Button asChild variant="outline" size="sm">
                  <Link to={playerRoutes.comparison}>
                    <Scale className="h-4 w-4" />
                    Comparar
                  </Link>
                </Button>
                <Button
                  id="players-filter-toggle"
                  variant={showFilters ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setShowFilters(value => !value)}
                  aria-expanded={showFilters}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('players.list.filters')}{activeFilters > 0 ? ` (${activeFilters})` : ''}
                </Button>
              </div>
            }
          />

          {showFilters && (
            <div className="space-y-md rounded-xl border border-outline-variant/30 bg-surface-container-low p-md">
              <div>
                <p className="mb-xs text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {t('players.list.position')}
                </p>
                <div className="flex flex-wrap gap-xs">
                  <Button
                    size="sm"
                    variant={selectedPosition === '' ? 'primary' : 'outline'}
                    onClick={() => setSelectedPosition('')}
                  >
                    {t('players.list.allPositions')}
                  </Button>
                  {ALL_POSITIONS.filter(position => position.value !== 'multiple').map(position => (
                    <Button
                      key={position.value}
                      size="sm"
                      variant={selectedPosition === position.value ? 'primary' : 'outline'}
                      style={
                        selectedPosition === position.value
                          ? {
                              borderColor: POSITION_COLOR[position.value],
                              background: `${POSITION_COLOR[position.value]}22`,
                              color: POSITION_COLOR[position.value],
                            }
                          : undefined
                      }
                      onClick={() => setSelectedPosition(position.value as PlayerPosition)}
                      title={position.fullLabel}
                    >
                      {position.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-md">
                <label className="block max-w-xs">
                  <span className="mb-xs block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {t('players.list.nationality')}
                  </span>
                  <Input
                    value={selectedNationality}
                    onChange={event => setSelectedNationality(event.target.value.toUpperCase())}
                    placeholder={t('players.list.nationalityPlaceholder')}
                    maxLength={3}
                    aria-label={t('players.list.nationality')}
                  />
                </label>

                <div>
                  <span className="mb-xs block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {t('players.list.availability')}
                  </span>
                  <div className="flex flex-wrap gap-xs">
                    <Button
                      size="sm"
                      variant={!showOnlyAvailable ? 'primary' : 'outline'}
                      onClick={() => setShowOnlyAvailable(false)}
                    >
                      Todos
                    </Button>
                    <Button
                      size="sm"
                      variant={showOnlyAvailable ? 'primary' : 'outline'}
                      onClick={() => setShowOnlyAvailable(true)}
                    >
                      {t('players.list.availableOnly')}
                    </Button>
                  </div>
                </div>

                {activeFilters > 0 && (
                  <div className="self-end pb-1">
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
      pagination={
        totalPages > 1 ? (
          <div className="flex flex-col items-center justify-between gap-md rounded-xl border border-outline-variant/30 bg-surface-container-low px-lg py-md sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Página <span className="font-semibold text-on-surface">{page}</span> de{' '}
              <span className="font-semibold text-on-surface">{totalPages}</span>
            </p>
            <div className="flex items-center gap-sm">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(value => Math.max(1, value - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(value => Math.min(totalPages, value + 1))}
              >
                Seguinte
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <PageSkeleton variant="list" />
      ) : isError ? (
        <ErrorState
          title={t('players.list.errorTitle')}
          message={t('players.list.errorMessage')}
          onRetry={() => listResult.refetch()}
        />
      ) : players.length === 0 ? (
        <EmptyState
          title={t('players.list.emptyTitle')}
          description={t('players.list.emptyDescription')}
          action={activeFilters > 0 ? { label: 'Limpar filtros', onClick: handleClearFilters } : undefined}
        />
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {players.map(player => (
            <PlayerCardCompact key={player.id} player={player} />
          ))}
        </div>
      )}
    </SportListLayout>
  )
}
