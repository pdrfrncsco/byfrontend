import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Button, NativeSelect, PageSkeleton } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { ExplorePageShell, ExploreSection, ResultCount, SearchToolbar } from '@/modules/shared/components'
import { usePublicOrganizations } from '../hooks'
import { OrganizationCard } from '../components'

export function OrganizationListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: organizations, isLoading, isError, refetch } = usePublicOrganizations({
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
  })

  const hasFilters = Boolean(debouncedSearch || typeFilter)
  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
  }

  return (
    <ExplorePageShell
      breadcrumbs={[{ label: 'Organizações' }]}
      eyebrow="Explorar organizações"
      title="Descubra organizações oficiais do ecossistema"
      description="Conheça federações, associações, ligas, organizadores e academias de futebol registados na plataforma BolaYetu."
    >
      <ExploreSection title="Diretório público" description="Pesquise por nome, localização ou tipo de organização.">
        <div className="space-y-lg">
          <SearchToolbar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome ou localização..."
            filters={
              <NativeSelect value={typeFilter} onChange={event => setTypeFilter(event.target.value)} aria-label="Filtrar por tipo">
                <option value="">Todos os tipos</option>
                <option value="federation">Federação</option>
                <option value="association">Associação</option>
                <option value="league">Liga</option>
                <option value="organizer">Organizador</option>
                <option value="academy">Academia</option>
              </NativeSelect>
            }
            actions={hasFilters ? <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar</Button> : undefined}
          />

          <ResultCount count={organizations?.length ?? 0} label={(organizations?.length ?? 0) === 1 ? 'organização encontrada' : 'organizações encontradas'} />

          {isLoading ? (
            <PageSkeleton variant="list" />
          ) : isError ? (
            <ErrorState title="Não foi possível carregar as organizações" message="Verifique a ligação e tente novamente." onRetry={refetch} />
          ) : organizations && organizations.length > 0 ? (
            <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-3">
              {organizations.map(organization => <OrganizationCard key={organization.id} organization={organization} />)}
            </div>
          ) : (
            <EmptyState
              title={hasFilters ? 'Sem resultados para os filtros' : 'Nenhuma organização registada'}
              description={hasFilters ? 'Experimente mudar os termos da pesquisa ou selecionar outra categoria.' : 'Não existem organizações públicas registadas de momento.'}
              action={hasFilters ? { label: 'Limpar filtros', onClick: clearFilters } : undefined}
            />
          )}
        </div>
      </ExploreSection>
    </ExplorePageShell>
  )
}
