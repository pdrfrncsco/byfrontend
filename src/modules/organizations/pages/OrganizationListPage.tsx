import { useState } from 'react'
import { Filter, Search } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { usePublicOrganizations } from '../hooks'
import {
  OrganizationCard,
  OrganizationListSkeleton,
  OrganizationEmptyState,
  OrganizationErrorState,
} from '../components'

export function OrganizationListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const {
    data: organizations,
    isLoading,
    isError,
    refetch,
  } = usePublicOrganizations({
    search: search || undefined,
    type: typeFilter || undefined,
  })

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
  }

  return (
    <div className="relative min-h-screen bg-background text-on-surface">
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      <div className="mx-auto max-w-7xl space-y-lg px-gutter py-xl">
        <div className="space-y-sm">
          <h1 className="font-display-lg text-4xl tracking-tight text-primary">Organizações</h1>
          <p className="max-w-xl text-body-md text-on-surface-variant">
            Descubra federações, associações e ligas oficiais de futebol registadas na plataforma BolaYetu.
          </p>
        </div>

        <div className="glass-card flex flex-col items-center justify-between gap-md border border-outline-variant/30 p-md md:flex-row">
          <div className="relative w-full md:flex-1">
            <Search
              className="absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
              aria-hidden="true"
            />
            <Input
              type="search"
              variant="search"
              placeholder="Pesquisar por nome ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Pesquisar organizações"
            />
          </div>

          <div className="flex w-full items-center gap-sm md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter
                className="absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
                aria-hidden="true"
              />
              <Select
                variant="filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filtrar por tipo"
                className="w-full md:w-56"
              >
                <option value="">Todos os tipos</option>
                <option value="federation">Federação</option>
                <option value="association">Associação</option>
                <option value="league">Liga</option>
                <option value="organizer">Organizador</option>
                <option value="academy">Academia</option>
              </Select>
            </div>

            {(search || typeFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {isLoading && <OrganizationListSkeleton />}

        {isError && (
          <div className="py-12">
            <OrganizationErrorState onRetry={refetch} />
          </div>
        )}

        {!isLoading && !isError && organizations && organizations.length > 0 && (
          <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}

        {!isLoading && !isError && (!organizations || organizations.length === 0) && (
          <div className="py-12">
            <OrganizationEmptyState
              title={search || typeFilter ? 'Sem resultados para os filtros' : 'Nenhuma organização registada'}
              description={
                search || typeFilter
                  ? 'Experimente mudar os termos da sua pesquisa ou selecionar uma categoria diferente.'
                  : 'Não existem organizações públicas registadas de momento.'
              }
              iconType="search"
              action={search || typeFilter ? { label: 'Limpar filtros', onClick: clearFilters } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
