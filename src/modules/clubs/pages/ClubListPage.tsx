import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { ClubCard } from '@/modules/clubs/components/ClubCard'
import { ClubEmptyState } from '@/modules/clubs/components/ClubEmptyState'
import { ClubListSkeleton } from '@/modules/clubs/components/ClubSkeleton'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/empty-state'
import { PublicListHero } from '@/modules/shared/components/PublicListHero'

const PAGE_SIZE_OPTIONS = [6, 9, 12, 18]

export default function ClubListPage() {
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

  const summary = useMemo(() => {
    const filters = [debouncedSearch, organization].filter(Boolean).length
    return `${filters} filtro(s) ativos`
  }, [debouncedSearch, organization])

  if (isError) {
    return (
      <div className="container py-xl">
        <ErrorState
          title="Não foi possível carregar os clubes"
          message="Verifique a ligação e tente novamente."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="container py-xl space-y-xl">
        <PublicListHero
          badge="Portal público de clubes"
          title="Descubra clubes, estrutura e identidade pública"
          description="Explore clubes do ecossistema BolaYetu com pesquisa rápida, paginação fluida e acesso direto ao plantel, staff, documentos e patrocinadores."
          stats={[
            { label: `${total} clube(s)` },
            { label: summary },
            { label: `${pageSize} por página` },
          ]}
          insightIcon={SlidersHorizontal}
          insightTitle="Filtros ativos"
          insightDescription="Pesquisa e organização atualizam a listagem em tempo real."
          metrics={[
            { label: 'Página atual', value: page },
            { label: 'Resultados', value: isFetching ? '...' : total },
          ]}
        />

        <Card variant="flat" padding="none">
          <CardContent className="grid gap-md p-lg lg:grid-cols-[1.3fr_1fr_auto_auto] lg:items-end">
            <label className="space-y-xs">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Pesquisar</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input
                  variant="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome do clube ou cidade"
                />
              </div>
            </label>

            <label className="space-y-xs">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Organização</span>
              <Input
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                placeholder="Slug da organização"
              />
            </label>

            <label className="space-y-xs">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Itens por página</span>
              <Select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setOrganization('')
                setPageSize(9)
                setPage(1)
              }}
            >
              Limpar
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <ClubListSkeleton />
        ) : clubs.length === 0 ? (
          <ClubEmptyState
            onReset={() => {
              setSearch('')
              setOrganization('')
              setPage(1)
            }}
          />
        ) : (
          <>
            <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
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
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Seguinte
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
