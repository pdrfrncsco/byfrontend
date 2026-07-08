import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
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
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.20),transparent_40%),radial-gradient(circle_at_top_right,rgba(17,94,89,0.16),transparent_38%),linear-gradient(180deg,rgba(7,16,29,0.94),rgba(7,16,29,0.08))]" />
      <div className="container py-xl space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/70 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur md:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Portal público de clubes
            </div>
            <div className="space-y-sm">
              <h1 className="font-title-lg text-4xl text-on-surface md:text-5xl">Descubra clubes, estrutura e identidade pública</h1>
              <p className="max-w-2xl text-base leading-7 text-on-surface-variant">
                Explore clubes do ecossistema BolaYetu com pesquisa rápida, paginação fluida e acesso direto ao plantel, staff, documentos e patrocinadores.
              </p>
            </div>
            <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                {total} clube(s)
              </span>
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                {summary}
              </span>
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                {pageSize} por página
              </span>
            </div>
          </div>

          <Card variant="flat" padding="none" className="border-outline-variant/20">
            <CardContent className="grid h-full gap-md p-lg">
              <div className="flex items-start gap-sm">
                <div className="rounded-2xl bg-primary-container/20 p-sm text-primary">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Filtros ativos</p>
                  <p className="text-sm text-on-surface-variant">Pesquisa e organização atualizam a listagem em tempo real.</p>
                </div>
              </div>

              <div className="grid gap-sm">
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">Página atual</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{page}</p>
                </div>
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">Resultados</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{isFetching ? '...' : total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

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
