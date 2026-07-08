import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { ClubCard } from '@/modules/clubs/components/ClubCard'
import { ClubEmptyState } from '@/modules/clubs/components/ClubEmptyState'
import { ClubListSkeleton } from '@/modules/clubs/components/ClubSkeleton'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/empty-state'

const PAGE_SIZE = 9

export default function ClubListPage() {
  const [search, setSearch] = useState('')
  const [organization, setOrganization] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, organization])

  const { data, isLoading, isError, refetch, isFetching } = useClubs({
    search: debouncedSearch || undefined,
    organization: organization || undefined,
    page,
    page_size: PAGE_SIZE,
  })

  const clubs = data?.results ?? []
  const total = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
    <div className="container py-xl space-y-lg">
      <section className="space-y-md">
        <div className="flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-xs">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Clubes públicos</p>
            <h1 className="font-title-lg text-3xl text-on-surface">Descubra os clubes do ecossistema</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Explore clubes públicos, consulte o plantel e aceda aos dados essenciais do perfil.
            </p>
          </div>
          <p className="text-sm text-on-surface-variant">
            {isFetching ? 'Atualizando...' : `${total} clube(s) encontrados`}
          </p>
        </div>

        <Card variant="flat" padding="none">
          <CardContent className="grid gap-md p-lg md:grid-cols-[1.6fr_1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
              <Input
                variant="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar por nome ou cidade"
              />
            </label>

            <Input
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              placeholder="Slug da organização"
            />

            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setOrganization('')
                setPage(1)
              }}
            >
              Limpar
            </Button>
          </CardContent>
        </Card>
      </section>

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

          <div className="flex flex-col items-center justify-between gap-md rounded-2xl border border-outline-variant/20 bg-surface-container/40 px-lg py-md md:flex-row">
            <p className="text-sm text-on-surface-variant">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-sm">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                Anterior
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                Seguinte
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
