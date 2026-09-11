import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { useCompetitionsPaginated } from '../hooks/useCompetitions'
import { Button, NativeSelect, PageSkeleton } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { CompetitionCard } from '../components/CompetitionCard'
import { SearchToolbar } from '@/modules/shared/components'
import { SportListLayout } from '@/modules/shared/components/sport'
import type { CompetitionStatus, CompetitionType } from '../types'

const PAGE_SIZE_OPTIONS = [6, 9, 12, 18]

export function CompetitionListPage() {
  useSeo({
    title: 'Competições',
    description: 'Explore campeonatos, taças e torneios de futebol em Angola e África.',
    path: '/competitions',
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | CompetitionType>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, typeFilter, pageSize])

  const { data, isLoading, isError, refetch, isFetching } = useCompetitionsPaginated({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    competition_type: typeFilter === 'all' ? undefined : typeFilter,
    page,
    page_size: pageSize,
  })

  const competitions = data?.results ?? []
  const total = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = debouncedSearch.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setPage(1)
  }

  return (
    <SportListLayout
      breadcrumb={
        <div className="flex items-center gap-xs">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">Competições</span>
        </div>
      }
      title="Competições"
      count={total}
      filters={
        <div className="space-y-sm">
          <SearchToolbar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome..."
            filters={
              <div className="flex flex-wrap items-center gap-sm">
                <label className="flex items-center gap-xs text-xs text-on-surface-variant">
                  <span className="sr-only">Estado:</span>
                  <NativeSelect value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
                    <option value="all">Todos os estados</option>
                    <option value="active">Em curso</option>
                    <option value="draft">Rascunho</option>
                    <option value="completed">Concluída</option>
                  </NativeSelect>
                </label>
                <label className="flex items-center gap-xs text-xs text-on-surface-variant">
                  <span className="sr-only">Tipo:</span>
                  <NativeSelect value={typeFilter} onChange={event => setTypeFilter(event.target.value as typeof typeFilter)}>
                    <option value="all">Todos os tipos</option>
                    <option value="league">Campeonato</option>
                    <option value="tournament">Torneio</option>
                    <option value="cup">Taça</option>
                  </NativeSelect>
                </label>
              </div>
            }
            actions={hasFilters ? <Button variant="ghost" size="sm" onClick={handleClearFilters}>Limpar</Button> : undefined}
          />

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>{total} {total === 1 ? 'competição encontrada' : 'competições encontradas'}</span>
            <label className="flex items-center gap-2">
              <span>Por página:</span>
              <NativeSelect value={String(pageSize)} onChange={event => setPageSize(Number(event.target.value))}>
                {PAGE_SIZE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </NativeSelect>
            </label>
          </div>
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
          title="Não foi possível carregar as competições"
          message="Verifique a ligação e tente novamente."
          onRetry={() => refetch()}
        />
      ) : competitions.length === 0 ? (
        <EmptyState
          title="Nenhuma competição encontrada"
          description="Tente ajustar os filtros ou a pesquisa para encontrar competições."
          action={hasFilters ? { label: 'Limpar filtros', onClick: handleClearFilters } : undefined}
        />
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3" aria-busy={isFetching}>
          {competitions.map(competition => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </SportListLayout>
  )
}
