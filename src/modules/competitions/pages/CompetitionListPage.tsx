import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { useCompetitionsPaginated } from '../hooks/useCompetitions'
import { Button, NativeSelect, PageSkeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { CompetitionCard } from '../components/CompetitionCard'
import { ExplorePageShell, ExploreSection, ResultCount, SearchToolbar } from '@/modules/shared/components'
import type { CompetitionStatus, CompetitionType } from '../types'

const PAGE_SIZE_OPTIONS = [6, 9, 12, 18]

export function CompetitionListPage() {
  useSeo({ title: 'Competições', description: 'Explore campeonatos, taças e torneios de futebol em Angola e África.', path: '/competitions' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | CompetitionType>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
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
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous) || page > 1
  const hasFilters = debouncedSearch.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'
  const competitionLabel = total === 1 ? 'competição' : 'competições'

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setPage(1)
  }

  return (
    <ExplorePageShell
      breadcrumbs={[{ label: 'Competições' }]}
      eyebrow="Explorar competições"
      title="Descubra campeonatos, taças e torneios"
      description="Encontre competições, acompanhe o calendário e consulte os resultados do futebol no ecossistema BolaYetu."
    >
      <ExploreSection title="Todas as competições" description="Pesquise e refine os resultados para encontrar a competição certa.">
        <div className="space-y-lg">
          <SearchToolbar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome..."
            filters={
              <>
                <label className="flex items-center gap-sm text-sm text-on-surface-variant">
                  <span className="sr-only">Filtrar por estado</span>
                  <NativeSelect value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
                    <option value="all">Todos os estados</option>
                    <option value="active">Em curso</option>
                    <option value="draft">Rascunho</option>
                    <option value="completed">Concluída</option>
                  </NativeSelect>
                </label>
                <label className="flex items-center gap-sm text-sm text-on-surface-variant">
                  <span className="sr-only">Filtrar por tipo</span>
                  <NativeSelect value={typeFilter} onChange={event => setTypeFilter(event.target.value as typeof typeFilter)}>
                    <option value="all">Todos os tipos</option>
                    <option value="league">Campeonato</option>
                    <option value="tournament">Torneio</option>
                    <option value="cup">Taça</option>
                  </NativeSelect>
                </label>
              </>
            }
            actions={hasFilters ? <Button variant="ghost" size="sm" onClick={handleClearFilters}>Limpar</Button> : undefined}
          />

          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <ResultCount count={total} label={`${competitionLabel} encontradas`} />
            <label className="flex items-center gap-sm text-sm text-on-surface-variant">
              <span>Por página</span>
              <NativeSelect value={String(pageSize)} onChange={event => setPageSize(Number(event.target.value))}>
                {PAGE_SIZE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </NativeSelect>
            </label>
          </div>

          {isLoading ? (
            <PageSkeleton variant="list" />
          ) : isError ? (
            <div role="alert" className="rounded-xl border border-error/30 bg-error-container/30 p-xl text-center">
              <p className="text-on-surface-variant">Não foi possível carregar as competições.</p>
              <Button variant="secondary" size="sm" className="mt-md" onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          ) : competitions.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Sem competições"
              description={hasFilters ? 'Nenhuma competição corresponde aos filtros aplicados. Ajuste a pesquisa ou limpe os filtros.' : 'Ainda não existe nenhuma competição registada.'}
              action={hasFilters ? { label: 'Limpar filtros', onClick: handleClearFilters } : undefined}
            />
          ) : (
            <>
              <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={isFetching}>
                {competitions.map(competition => <CompetitionCard key={competition.id} competition={competition} />)}
              </div>
              <div className="flex flex-col items-center justify-between gap-md rounded-xl border border-outline-variant bg-surface-container-low px-lg py-md sm:flex-row">
                <p className="text-sm text-on-surface-variant">Página <span className="font-semibold text-on-surface">{page}</span> de <span className="font-semibold text-on-surface">{totalPages}</span></p>
                <div className="flex items-center gap-sm">
                  <Button variant="secondary" size="sm" disabled={!hasPrev} onClick={() => setPage(value => Math.max(1, value - 1))}>Anterior</Button>
                  <Button variant="secondary" size="sm" disabled={!hasNext} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Seguinte</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </ExploreSection>
    </ExplorePageShell>
  )
}
