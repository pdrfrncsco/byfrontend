import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { PlayerCard, PlayerEmptyState, PlayerListSkeleton } from '../components'
import { usePlayers, usePlayerSearch } from '../hooks'
import { ALL_POSITIONS, POSITION_COLOR } from '../constants'
import type { Player, PlayerPosition } from '../types'

export function PlayerListPage() {
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
          title="Não foi possível carregar os jogadores"
          message="Verifique a ligação e tente novamente."
          onRetry={() => activeResult.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(148,211,193,0.18),transparent_40%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_38%),linear-gradient(180deg,rgba(7,16,29,0.94),rgba(7,16,29,0.08))]" />
      <div className="container py-xl space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/70 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur md:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma global de jogadores
            </div>
            <div className="space-y-sm">
              <h1 className="font-title-lg text-4xl text-on-surface md:text-5xl">Jogadores</h1>
              <p className="max-w-2xl text-base leading-7 text-on-surface-variant">
                Explore perfis profissionais, estatísticas de carreira, documentos, vídeos e conquistas dos jogadores do ecossistema BolaYetu.
              </p>
            </div>
            <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                {totalCount} jogador(es)
              </span>
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                {activeFilters} filtro(s) ativos
              </span>
              {isSearching && (
                <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                  Pesquisa: &quot;{debouncedSearch}&quot;
                </span>
              )}
            </div>
          </div>

          <Card variant="flat" padding="none" className="border-outline-variant/20">
            <CardContent className="grid h-full gap-md p-lg">
              <div className="flex items-start gap-sm">
                <div className="rounded-2xl bg-primary-container/20 p-sm text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Descoberta rápida</p>
                  <p className="text-sm text-on-surface-variant">Pesquise por nome ou filtre por posição e nacionalidade.</p>
                </div>
              </div>
              <div className="grid gap-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">Página</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{page}</p>
                </div>
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">Resultados</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{isLoading ? '...' : totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card variant="flat" padding="none">
          <CardContent className="space-y-md p-lg">
            <div className="flex flex-col gap-md lg:flex-row lg:items-end">
              <label className="flex-1 space-y-xs">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Pesquisar</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <Input
                    id="players-search-input"
                    variant="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Pesquisar jogador por nome..."
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
                Filtros
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-md rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
                <div className="space-y-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Posição</p>
                  <div className="flex flex-wrap gap-sm">
                    <Button
                      size="sm"
                      variant={selectedPosition === '' ? 'primary' : 'outline'}
                      onClick={() => setSelectedPosition('')}
                    >
                      Todas
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
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Nacionalidade</span>
                  <Input
                    id="nationality-filter"
                    value={selectedNationality}
                    onChange={(event) => setSelectedNationality(event.target.value.toUpperCase())}
                    placeholder="ex: AO, PT, BR..."
                    maxLength={3}
                  />
                </label>

                {activeFilters > 0 && (
                  <Button id="players-clear-filters" variant="ghost" onClick={handleClearFilters}>
                    Limpar filtros
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
              Anterior
            </Button>
            <span className="text-sm text-on-surface-variant">Página {page}</span>
            <Button
              id="players-page-next"
              variant="secondary"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasNext}
            >
              Seguinte
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
