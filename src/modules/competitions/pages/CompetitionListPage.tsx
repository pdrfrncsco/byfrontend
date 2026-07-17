import { useState, useMemo } from 'react'
import { Trophy, Filter, Search } from 'lucide-react'
import { useCompetitions } from '../hooks/useCompetitions'
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
import type { Competition, CompetitionStatus, CompetitionType } from '../types'

export function CompetitionListPage() {
  const { data: competitions = [], isLoading, isError, refetch } = useCompetitions()

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | CompetitionType>('all')

  // Filtered competitions
  const filteredCompetitions = useMemo(() => {
    const list = competitions as Competition[]
    const term = search.trim().toLowerCase()

    return list.filter((comp) => {
      const matchesSearch = !term || comp.name.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || comp.status === statusFilter
      const matchesType = typeFilter === 'all' || comp.competition_type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [search, statusFilter, typeFilter, competitions])

  const hasFilters = search.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  return (
    <div className="relative overflow-hidden">
      <div className="container py-xl space-y-xl">
        <PublicListHero
          badge="Competições"
          title="Descubra campeonatos, taças e torneios"
          description="Campeonatos, taças e torneios organizados na plataforma. Use os filtros para encontrar competições específicas."
          stats={[
            {
              label: `${filteredCompetitions.length} competição${filteredCompetitions.length !== 1 ? 'ões' : ''} encontrada${filteredCompetitions.length !== 1 ? 's' : ''}`,
            },
            { label: hasFilters ? 'Filtros aplicados' : 'Sem filtros ativos' },
            { label: `${competitions.length} no total` },
          ]}
          insightIcon={Trophy}
          insightTitle="Exploração de competições"
          insightDescription="Filtre por nome, estado e tipo para localizar rapidamente a competição certa."
          metrics={[
            { label: 'Resultados', value: isLoading ? '...' : filteredCompetitions.length },
            { label: 'Total', value: competitions.length },
          ]}
        />

        {/* Filters */}
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
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

            {hasFilters && (
              <div className="mt-md flex justify-end">
                <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <CompetitionSkeleton />
        ) : isError ? (
          <Card variant="flat" padding="lg">
            <div className="text-center">
              <p className="text-on-surface-variant">Erro ao carregar competições.</p>
              <Button variant="secondary" size="sm" className="mt-md" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : filteredCompetitions.length === 0 ? (
          <CompetitionEmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
        ) : (
          <div className="space-y-md">
            {/* Results count */}
            <p className="text-sm text-on-surface-variant">
              {filteredCompetitions.length} competição
              {filteredCompetitions.length !== 1 ? 'ões' : ''} encontrada
              {filteredCompetitions.length !== 1 ? 's' : ''}
              {hasFilters && ' com os filtros aplicados'}
            </p>

            {/* Competition list */}
            {filteredCompetitions.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
