import { useEffect, useMemo, useState } from 'react'
import { Trophy, Filter, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useCompetitionsPaginated } from '../hooks/useCompetitions'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
} from '@/components/ui'
import { CompetitionCard } from '../components/CompetitionCard'
import { CompetitionSkeleton } from '../components/CompetitionSkeleton'
import { CompetitionEmptyState } from '../components/CompetitionEmptyState'
import { PublicListHero } from '@/modules/shared/components/PublicListHero'
import type { CompetitionStatus, CompetitionType } from '../types'

const PAGE_SIZE_OPTIONS = [6, 9, 12, 18]

export function CompetitionListPage() {
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

  const summary = useMemo(() => {
    const filters = [
      debouncedSearch,
      statusFilter !== 'all' ? statusFilter : '',
      typeFilter !== 'all' ? typeFilter : '',
    ].filter(Boolean)
    return filters.length > 0 ? `${filters.length} filtro(s) ativos` : 'Sem filtros ativos'
  }, [debouncedSearch, statusFilter, typeFilter])

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setPage(1)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      {/* Background Gradient Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
        <PublicListHero
          badge="Competições"
          title="Descubra campeonatos, taças e torneios"
          description="Campeonatos, taças e torneios organizados na plataforma. Use os filtros para encontrar competições específicas."
          stats={[
            { label: `${total} ${competitionLabel}` },
            { label: summary },
            { label: `${pageSize} por página` },
          ]}
          insightIcon={Trophy}
          insightTitle="Exploração de competições"
          insightDescription="Filtre por nome, estado e tipo para localizar rapidamente a competição certa."
          metrics={[
            { label: 'Página atual', value: page },
            { label: 'Resultados', value: isFetching ? '...' : competitions.length },
          ]}
        />

        <Card variant="flat" padding="none" className="border border-outline-variant/20 shadow-lg">
          <CardHeader className="border-b border-outline-variant/10">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-md md:grid-cols-3">
              <FormField label="Pesquisar" htmlFor="search">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <Input
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    placeholder="Nome da competição..."
                  />
                </div>
              </FormField>

              <FormField label="Estado" htmlFor="status">
                <Select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <option value="all">Todos</option>
                  <option value="active">Em Curso</option>
                  <option value="draft">Rascunho</option>
                  <option value="completed">Concluída</option>
                </Select>
              </FormField>

              <FormField label="Tipo" htmlFor="type">
                <Select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                >
                  <option value="all">Todos</option>
                  <option value="league">Campeonato</option>
                  <option value="tournament">Torneio</option>
                  <option value="cup">Taça</option>
                </Select>
              </FormField>
            </div>

            <div className="mt-md flex flex-col items-start justify-between gap-md md:flex-row md:items-center">
              <p className="text-sm text-on-surface-variant">
                Página <span className="font-semibold text-on-surface">{page}</span> de{' '}
                <span className="font-semibold text-on-surface">{totalPages}</span>
              </p>

              <div className="flex items-center gap-sm">
                {hasFilters && (
                  <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                    Limpar filtros
                  </Button>
                )}
                <label className="flex items-center gap-sm text-sm text-on-surface-variant">
                  <span className="whitespace-nowrap">Por página</span>
                  <Select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <CompetitionSkeleton />
        ) : isError ? (
          <Card variant="flat" padding="lg" className="border border-error/20 bg-error/5">
            <div className="text-center">
              <p className="text-on-surface-variant">Erro ao carregar competições.</p>
              <Button variant="secondary" size="sm" className="mt-md" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : competitions.length === 0 ? (
          <CompetitionEmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
        ) : (
          <div className="space-y-md">
            <p className="text-sm text-on-surface-variant">
              {total} {competitionLabel} encontrada{total !== 1 ? 's' : ''}
              {hasFilters && ' com os filtros aplicados'}
            </p>

            {/* Responsive Grid Layout for Competition Cards */}
            <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {competitions.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-md rounded-[1.5rem] border border-outline-variant/20 bg-surface-container/70 px-lg py-md backdrop-blur md:flex-row">
              <p className="text-sm text-on-surface-variant">
                Página <span className="font-semibold text-on-surface">{page}</span> de{' '}
                <span className="font-semibold text-on-surface">{totalPages}</span>
              </p>
              <div className="flex items-center gap-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Seguinte
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
