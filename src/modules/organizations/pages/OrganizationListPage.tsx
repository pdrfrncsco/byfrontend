import { useState } from 'react'
import { Building2, Filter, Search } from 'lucide-react'
import { Button, Card, CardContent, Input, NativeSelect, PageSkeleton } from '@/components/ui'
import { PublicListHero } from '@/modules/shared/components/PublicListHero'
import { usePublicOrganizations } from '../hooks'
import { OrganizationCard } from '../components'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'

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
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      {/* Background Gradient Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
        <PublicListHero
          badge="Organizações"
          title="Descubra organizações oficiais do ecossistema"
          description="Descubra federações, associações e ligas oficiais de futebol registadas na plataforma BolaYetu."
          stats={[
            { label: `${organizations?.length ?? 0} organização(ões)` },
            { label: search || typeFilter ? 'Filtros aplicados' : 'Sem filtros ativos' },
            { label: typeFilter || 'Todos os tipos' },
          ]}
          insightIcon={Building2}
          insightTitle="Diretório público"
          insightDescription="Pesquise por nome, localização ou tipo de organização para encontrar entidades oficiais."
          metrics={[
            { label: 'Resultados', value: isLoading ? '...' : (organizations?.length ?? 0) },
            { label: 'Filtros', value: [search, typeFilter].filter(Boolean).length },
          ]}
          backgroundClassName="bg-[radial-gradient(circle_at_top_left,rgba(var(--color-primary-rgb),0.18),transparent_40%),radial-gradient(circle_at_top_right,rgba(233,195,73,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.06))]"
        />

        <Card variant="flat" padding="none">
          <CardContent className="flex flex-col items-center justify-between gap-md p-lg md:flex-row">
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
                <NativeSelect
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
                </NativeSelect>
              </div>

              {(search || typeFilter) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading && <PageSkeleton variant="list" />}

        {isError && (
          <div className="py-12">
            <ErrorState onRetry={refetch} />
          </div>
        )}

        {!isLoading && !isError && organizations && organizations.length > 0 && (
          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}

        {!isLoading && !isError && (!organizations || organizations.length === 0) && (
          <div className="py-12">
            <EmptyState
              title={search || typeFilter ? 'Sem resultados para os filtros' : 'Nenhuma organização registada'}
              description={
                search || typeFilter
                  ? 'Experimente mudar os termos da sua pesquisa ou selecionar uma categoria diferente.'
                  : 'Não existem organizações públicas registadas de momento.'
              }
              action={search || typeFilter ? { label: 'Limpar filtros', onClick: clearFilters } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
