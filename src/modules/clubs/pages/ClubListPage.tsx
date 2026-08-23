import { useEffect, useState } from 'react'
import { ClubCard } from '@/modules/clubs/components/ClubCard'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { NativeSelect } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import { ExplorePageShell, ExploreSection, ResultCount, SearchToolbar } from '@/modules/shared/components'

const PAGE_SIZE_OPTIONS = [6, 9, 12, 18]

export default function ClubListPage() {
  useSeo({ title: 'Clubes', description: 'Descubra clubes, plantéis e comunidades do futebol em Angola e África.', path: '/clubs' })
  const [search, setSearch] = useState('')
  const [organization, setOrganization] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
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
    setPageSize(9)
    setPage(1)
  }

  return (
    <ExplorePageShell
      breadcrumbs={[{ label: 'Clubes' }]}
      eyebrow="Explorar clubes"
      title="Descubra clubes, estrutura e identidade pública"
      description="Explore clubes do ecossistema BolaYetu e aceda diretamente a plantéis, staff, competições e informação institucional."
    >
      <ExploreSection title="Todos os clubes" description="Pesquise por nome, cidade ou organização para encontrar um clube.">
        <div className="space-y-lg">
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

          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <ResultCount count={total} label={total === 1 ? 'clube encontrado' : 'clubes encontrados'} />
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
            <ErrorState title="Não foi possível carregar os clubes" message="Verifique a ligação e tente novamente." onRetry={() => refetch()} />
          ) : clubs.length === 0 ? (
            <EmptyState title="Nenhum clube encontrado" description="Tente ajustar os filtros ou limpar a pesquisa para encontrar clubes." action={hasFilters ? { label: 'Limpar filtros', onClick: clearFilters } : undefined} />
          ) : (
            <>
              <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-3" aria-busy={isFetching}>
                {clubs.map(club => <ClubCard key={club.id} club={club} />)}
              </div>
              <div className="flex flex-col items-center justify-between gap-md rounded-xl border border-outline-variant bg-surface-container-low px-lg py-md sm:flex-row">
                <p className="text-sm text-on-surface-variant">Página <span className="font-semibold text-on-surface">{page}</span> de <span className="font-semibold text-on-surface">{totalPages}</span></p>
                <div className="flex items-center gap-sm">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Anterior</Button>
                  <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Seguinte</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </ExploreSection>
    </ExplorePageShell>
  )
}
