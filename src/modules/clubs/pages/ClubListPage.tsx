import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { NativeSelect } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/modules/shared/components'
import { SportListLayout } from '@/modules/shared/components/sport'
import { ClubCardCompact } from '@/modules/clubs/components/ClubCardCompact'

const PAGE_SIZE_OPTIONS = [9, 12, 18, 24]

export default function ClubListPage() {
  useSeo({
    title: 'Clubes',
    description: 'Descubra clubes, plantéis e comunidades do futebol em Angola e África.',
    path: '/clubs',
  })
  const [search, setSearch] = useState('')
  const [organization, setOrganization] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, organization, pageSize])

  const { data, isLoading, isError, refetch, isFetching } = useClubs({
    search: debouncedSearch || undefined,
    organization: organization || undefined,
    page,
    page_size: pageSize,
  })

  const clubs = data?.results ?? []
  const total = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = debouncedSearch.trim() !== '' || organization.trim() !== ''

  const clearFilters = () => {
    setSearch('')
    setOrganization('')
    setPageSize(12)
    setPage(1)
  }

  return (
    <SportListLayout
      breadcrumb={
        <div className="flex items-center gap-xs">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">Clubes</span>
        </div>
      }
      title="Clubes"
      count={total}
      filters={
        <div className="space-y-sm">
          <SearchToolbar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome ou cidade..."
            filters={
              <input
                value={organization}
                onChange={event => setOrganization(event.target.value)}
                placeholder="Organização"
                aria-label="Filtrar por organização"
                className="h-10 w-full min-w-40 rounded-lg border border-outline-variant bg-surface-container-high px-md text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-auto"
              />
            }
            actions={hasFilters ? <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar</Button> : undefined}
          />

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>{total} {total === 1 ? 'clube disponível' : 'clubes disponíveis'}</span>
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
              Página <span className="font-semibold text-on-surface">{page}</span> de <span className="font-semibold text-on-surface">{totalPages}</span>
            </p>
            <div className="flex items-center gap-sm">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>
                Anterior
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>
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
          title="Não foi possível carregar os clubes"
          message="Verifique a ligação e tente novamente."
          onRetry={() => refetch()}
        />
      ) : clubs.length === 0 ? (
        <EmptyState
          title="Nenhum clube encontrado"
          description="Tente ajustar os filtros ou limpar a pesquisa para encontrar clubes."
          action={hasFilters ? { label: 'Limpar filtros', onClick: clearFilters } : undefined}
        />
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3" aria-busy={isFetching}>
          {clubs.map(club => (
            <ClubCardCompact key={club.id} club={club} />
          ))}
        </div>
      )}
    </SportListLayout>
  )
}
