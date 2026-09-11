import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useSeo } from '@/hooks/useSeo'
import { Button, NativeSelect, PageSkeleton } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { SearchToolbar } from '@/modules/shared/components'
import { SportListLayout } from '@/modules/shared/components/sport'
import { usePublicOrganizations } from '../hooks'
import { OrganizationCardCompact } from '../components'

export function OrganizationListPage() {
  useSeo({
    title: 'Organizações',
    description: 'Conheça federações, associações, ligas e academias do ecossistema BolaYetu.',
    path: '/organizations',
  })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: organizations, isLoading, isError, refetch } = usePublicOrganizations({
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
  })

  const count = organizations?.length ?? 0
  const hasFilters = Boolean(debouncedSearch || typeFilter)
  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
  }

  return (
    <SportListLayout
      breadcrumb={
        <div className="flex items-center gap-xs">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">Organizações</span>
        </div>
      }
      title="Organizações"
      count={count}
      filters={
        <div className="space-y-sm">
          <SearchToolbar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome ou localização..."
            filters={
              <NativeSelect
                value={typeFilter}
                onChange={event => setTypeFilter(event.target.value)}
                aria-label="Filtrar por tipo"
              >
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

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>{count} {count === 1 ? 'organização encontrada' : 'organizações encontradas'}</span>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <PageSkeleton variant="list" />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar as organizações"
          message="Verifique a ligação e tente novamente."
          onRetry={refetch}
        />
      ) : organizations && organizations.length > 0 ? (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map(organization => (
            <OrganizationCardCompact key={organization.id} organization={organization} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasFilters ? 'Sem resultados para os filtros' : 'Nenhuma organização registada'}
          description={
            hasFilters
              ? 'Experimente mudar os termos da pesquisa ou selecionar outra categoria.'
              : 'Não existem organizações públicas registadas de momento.'
          }
          action={hasFilters ? { label: 'Limpar filtros', onClick: clearFilters } : undefined}
        />
      )}
    </SportListLayout>
  )
}
