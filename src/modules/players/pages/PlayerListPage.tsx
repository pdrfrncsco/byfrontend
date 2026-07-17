import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { PublicListHero } from '@/modules/shared/components/PublicListHero'
import { PlayerCard, PlayerEmptyState, PlayerListSkeleton } from '../components'
import { usePlayers, usePlayerSearch } from '../hooks'
import { ALL_POSITIONS, POSITION_COLOR } from '../constants'
import type { Player, PlayerPosition } from '../types'

export function PlayerListPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition | ''>('')
  const [selectedNationality, setSelectedNationality] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 350)
  const isSearching = debouncedSearch.length >= 2

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedPosition, selectedNationality])

  const searchResult = usePlayerSearch(debouncedSearch)
  const listResult = usePlayers({
    page,
    position: selectedPosition || undefined,
    nationality: selectedNationality || undefined,
  })

  const activeResult = isSearching ? searchResult : listResult
  const isLoading = activeResult.isLoading
  const isError = activeResult.isError

  const players: Player[] = isSearching
    ? (searchResult.data ?? [])
    : (listResult.data?.results ?? [])

  const totalCount = isSearching
    ? players.length
    : (listResult.data?.count ?? 0)

  const hasNext = !isSearching && Boolean(listResult.data?.next)
  const hasPrev = !isSearching && page > 1

  const activeFilters = useMemo(() => {
    return [selectedPosition, selectedNationality].filter(Boolean).length
  }, [selectedPosition, selectedNationality])

  const handleClearFilters = useCallback(() => {
    setSelectedPosition('')
    setSelectedNationality('')
    setPage(1)
  }, [])

  if (isError) {
    return (
      <div className="container py-xl">
        <ErrorState
          title={t('players.list.loadErrorTitle')}
          message={t('players.list.loadErrorMessage')}
          onRetry={() => activeResult.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="container py-xl space-y-xl">
        <PublicListHero
          badge={t('players.list.badge')}
          title={t('players.list.title')}
          description={t('players.list.subtitle')}
          stats={[
            { label: t('players.list.playersCount', { count: totalCount }) },
            { label: t('players.list.activeFilters', { count: activeFilters }) },
            ...(isSearching ? [{ label: t('players.list.searchActive', { query: debouncedSearch }) }] : []),
          ]}
          insightIcon={User}
          insightTitle={t('players.list.discoveryTitle')}
          insightDescription={t('players.list.discoveryDescription')}
          metrics={[
            { label: t('players.list.page'), value: page },
            { label: t('players.list.results'), value: isLoading ? '...' : totalCount },
          ]}
          backgroundClassName="bg-[radial-gradient(circle_at_top_left,rgba(148,211,193,0.18),transparent_40%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_38%),linear-gradient(180deg,rgba(7,16,29,0.94),rgba(7,16,29,0.08))]"
        />

        <Card variant="flat" padding="none">
          <CardContent className="space-y-md p-lg">
            <div className="flex flex-col gap-md lg:flex-row lg:items-end">
              <label className="flex-1 space-y-xs">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {t('players.list.searchLabel')}
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <Input
                    id="players-search-input"
                    variant="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t('players.list.searchPlaceholder')}
                    className="pl-10"
                  />
                </div>
              </label>
              <Button
                id="players-filter-toggle"
                variant={showFilters ? 'primary' : 'secondary'}
                onClick={() => setShowFilters((value) => !value)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('players.list.filters')}
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-md rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
                <div className="space-y-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    {t('players.list.position')}
                  </p>
                  <div className="flex flex-wrap gap-sm">
                    <Button
                      size="sm"
                      variant={selectedPosition === '' ? 'primary' : 'outline'}
                      onClick={() => setSelectedPosition('')}
                    >
                      {t('players.list.allPositions')}
                    </Button>
                    {ALL_POSITIONS.filter((position) => position.value !== 'multiple').map((position) => (
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

                <label className="block max-w-xs space-y-xs">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    {t('players.list.nationality')}
                  </span>
                  <Input
                    id="nationality-filter"
                    value={selectedNationality}
                    onChange={(event) => setSelectedNationality(event.target.value.toUpperCase())}
                    placeholder={t('players.list.nationalityPlaceholder')}
                    maxLength={3}
                  />
                </label>

                {activeFilters > 0 && (
                  <Button id="players-clear-filters" variant="ghost" onClick={handleClearFilters}>
                    {t('players.list.clearFilters')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <PlayerListSkeleton />
        ) : players.length === 0 ? (
          <PlayerEmptyState
            message={
              isSearching
                ? `Sem resultados para "${debouncedSearch}"`
                : 'Nenhum jogador encontrado com os filtros seleccionados.'
            }
            onReset={activeFilters > 0 ? handleClearFilters : undefined}
          />
        ) : (
          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {!isSearching && (hasPrev || hasNext) && (
          <div className="flex items-center justify-center gap-md">
            <Button
              id="players-page-prev"
              variant="secondary"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('players.list.previous')}
            </Button>
            <span className="text-sm text-on-surface-variant">{t('players.list.page')} {page}</span>
            <Button
              id="players-page-next"
              variant="secondary"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasNext}
            >
              {t('players.list.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
