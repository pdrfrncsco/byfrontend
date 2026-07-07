import { useState } from 'react'
import { usePublicOrganizations } from '../hooks'
import {
  OrganizationCard,
  OrganizationListSkeleton,
  OrganizationEmptyState,
  OrganizationErrorState
} from '../components'
import { Search, Filter } from 'lucide-react'

export function OrganizationListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const {
    data: organizations,
    isLoading,
    isError,
    refetch
  } = usePublicOrganizations({
    search: search || undefined,
    type: typeFilter || undefined,
  })

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
  }

  return (
    <div className="min-h-screen bg-background text-on-surface relative">
      {/* Background glow effects */}
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      <div className="max-w-7xl mx-auto px-gutter py-xl space-y-lg">
        {/* Header */}
        <div className="space-y-sm">
          <h1 className="font-display-lg text-4xl text-primary tracking-tight">
            Organizações
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            Descubra federações, associações e ligas oficiais de futebol registadas na plataforma BolaYetu.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="glass-card p-md border border-outline-variant/30 flex flex-col md:flex-row gap-md items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-md top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/50 rounded-lg pl-xl pr-md py-sm text-sm text-[#d3e4fe] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-sm w-full md:w-auto items-center">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-md top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-56 bg-surface-container border border-outline-variant/50 rounded-lg pl-xl pr-lg py-sm text-sm text-[#d3e4fe] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer appearance-none"
              >
                <option value="">Todos os tipos</option>
                <option value="federation">Federação</option>
                <option value="association">Associação</option>
                <option value="league">Liga</option>
                <option value="organizer">Organizador</option>
                <option value="academy">Academia</option>
              </select>
              <div className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                ▼
              </div>
            </div>

            {(search || typeFilter) && (
              <button
                onClick={clearFilters}
                className="px-md py-sm text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* States Rendering */}
        {isLoading && <OrganizationListSkeleton />}

        {isError && (
          <div className="py-12">
            <OrganizationErrorState onRetry={refetch} />
          </div>
        )}

        {!isLoading && !isError && organizations && organizations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}

        {!isLoading && !isError && (!organizations || organizations.length === 0) && (
          <div className="py-12">
            <OrganizationEmptyState
              title={search || typeFilter ? "Sem resultados para os filtros" : "Nenhuma organização registada"}
              description={
                search || typeFilter
                  ? "Experimente mudar os termos da sua pesquisa ou selecionar uma categoria diferente."
                  : "Não existem organizações públicas registadas de momento."
              }
              iconType="search"
              action={search || typeFilter ? { label: "Limpar filtros", onClick: clearFilters } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
