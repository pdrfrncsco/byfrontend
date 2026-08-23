import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, SlidersHorizontal, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { ErrorState, EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { ExplorePageShell, ExploreSection, ResultCount, SearchToolbar } from '@/modules/shared/components'
import { PlayerCard } from '../components'
import { usePlayers } from '../hooks'
import { ALL_POSITIONS, POSITION_COLOR } from '../constants'
import type { Player, PlayerPosition } from '../types'

export function PlayerListPage() {
  const { t } = useTranslation()
  useSeo({ title: 'Jogadores', description: 'Descubra jogadores, talentos e perfis públicos do futebol em Angola e África.', path: '/players' })
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
    page_size: 12,
    search: isSearching ? debouncedSearch : undefined,
    position: selectedPosition || undefined,
    nationality: selectedNationality || undefined,
    without_club: showOnlyAvailable || undefined,
  })

  const isLoading = listResult.isLoading
  const isError = listResult.isError
  const players: Player[] = listResult.data?.results ?? []
  const totalCount = listResult.data?.count ?? 0
  const hasNext = Boolean(listResult.data?.next)
  const hasPrev = page > 1
  const activeFilters = useMemo(() => [selectedPosition, selectedNationality, showOnlyAvailable ? 'available' : ''].filter(Boolean).length, [selectedPosition, selectedNationality, showOnlyAvailable])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedPosition('')
    setSelectedNationality('')
    setShowOnlyAvailable(false)
    setPage(1)
  }, [])

  return (
    <ExplorePageShell
      breadcrumbs={[{ label: 'Jogadores' }]}
      eyebrow={t('players.list.badge')}
      title={t('players.list.title')}
      description={t('players.list.subtitle')}
    >
      <ExploreSection title="Diretório de jogadores" description={t('players.list.discoveryDescription')}>
        <div className="space-y-lg">
          <SearchToolbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('players.list.searchPlaceholder')}
            actions={
              <Button id="players-filter-toggle" variant={showFilters ? 'primary' : 'secondary'} size="sm" onClick={() => setShowFilters(value => !value)} aria-expanded={showFilters}>
                <SlidersHorizontal className="h-4 w-4" />
                {t('players.list.filters')}{activeFilters > 0 ? ` (${activeFilters})` : ''}
              </Button>
            }
          />

          {showFilters && (
            <div className="space-y-lg rounded-xl border border-outline-variant bg-surface-container-low p-lg">
              <div>
                <p className="mb-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t('players.list.position')}</p>
                <div className="flex flex-wrap gap-sm">
                  <Button size="sm" variant={selectedPosition === '' ? 'primary' : 'outline'} onClick={() => setSelectedPosition('')}>{t('players.list.allPositions')}</Button>
                  {ALL_POSITIONS.filter(position => position.value !== 'multiple').map(position => (
                    <Button key={position.value} size="sm" variant={selectedPosition === position.value ? 'primary' : 'outline'} style={selectedPosition === position.value ? { borderColor: POSITION_COLOR[position.value], background: `${POSITION_COLOR[position.value]}22`, color: POSITION_COLOR[position.value] } : undefined} onClick={() => setSelectedPosition(position.value as PlayerPosition)} title={position.fullLabel}>
                      {position.label}
                    </Button>
                  ))}
                </div>
              </div>
              <label className="block max-w-xs">
                <span className="mb-sm block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t('players.list.nationality')}</span>
                <Input value={selectedNationality} onChange={event => setSelectedNationality(event.target.value.toUpperCase())} placeholder={t('players.list.nationalityPlaceholder')} maxLength={3} aria-label={t('players.list.nationality')} />
              </label>
              <div>
                <p className="mb-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t('players.list.availability')}</p>
                <div className="flex flex-wrap gap-sm">
                  <Button size="sm" variant={!showOnlyAvailable ? 'primary' : 'outline'} onClick={() => setShowOnlyAvailable(false)}>{t('players.list.allPlayers')}</Button>
                  <Button size="sm" variant={showOnlyAvailable ? 'primary' : 'outline'} onClick={() => setShowOnlyAvailable(true)}>✓ {t('players.list.onlyAvailable')}</Button>
                </div>
              </div>
              {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={handleClearFilters}>{t('players.list.clearFilters')}</Button>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-sm">
            <ResultCount count={totalCount} label={t('players.list.playersCount', { count: totalCount }).replace(String(totalCount), '').trim()} />
            {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={handleClearFilters}>{t('players.list.clearFilters')}</Button>}
          </div>

          {isLoading ? (
            <PageSkeleton variant="list" />
          ) : isError ? (
            <ErrorState title={t('players.list.loadErrorTitle')} message={t('players.list.loadErrorMessage')} onRetry={() => listResult.refetch()} />
          ) : players.length === 0 ? (
            <EmptyState icon={User} title={isSearching ? `Sem resultados para "${debouncedSearch}"` : 'Nenhum jogador encontrado'} description={isSearching ? 'Tente pesquisar por outro nome ou ajuste os filtros.' : 'Nenhum jogador encontrado com os filtros seleccionados.'} action={activeFilters > 0 ? { label: t('players.list.clearFilters'), onClick: handleClearFilters, variant: 'secondary' } : undefined} />
          ) : (
            <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-3" aria-busy={listResult.isFetching}>
              {players.map(player => <PlayerCard key={player.id} player={player} />)}
            </div>
          )}

          {(hasPrev || hasNext) && <div className="flex items-center justify-center gap-md rounded-xl border border-outline-variant bg-surface-container-low px-lg py-md">
            <Button id="players-page-prev" variant="secondary" size="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={!hasPrev}><ChevronLeft className="h-4 w-4" />{t('players.list.previous')}</Button>
            <span className="text-sm text-on-surface-variant">{t('players.list.page')} {page}</span>
            <Button id="players-page-next" variant="secondary" size="sm" onClick={() => setPage(current => current + 1)} disabled={!hasNext}>{t('players.list.next')}<ChevronRight className="h-4 w-4" /></Button>
          </div>}
        </div>
      </ExploreSection>
    </ExplorePageShell>
  )
}
