import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Shield, Building2, Users, Search, X, ArrowRight, Sparkles, ChevronRight, Compass } from 'lucide-react'
import { ROUTES } from '@/constants'
import { useSeo } from '@/hooks/useSeo'
import { useDebounce } from '@/hooks/useDebounce'
import { ExplorePageShell } from '@/modules/shared/components/explore/ExplorePageShell'
import { useCompetitionsPaginated } from '@/modules/competitions/hooks/useCompetitions'
import { CompetitionCard } from '@/modules/competitions/components/CompetitionCard'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { ClubCardCompact } from '@/modules/clubs/components/ClubCardCompact'
import { usePublicOrganizations } from '@/modules/organizations/hooks'
import { OrganizationCardCompact } from '@/modules/organizations/components'
import { usePlayers } from '@/modules/players/hooks'
import { PlayerCardCompact } from '@/modules/players/components'

type CategoryFilter = 'all' | 'competitions' | 'clubs' | 'organizations' | 'players'

interface PillarItem {
  id: CategoryFilter
  title: string
  description: string
  href: string
  icon: typeof Trophy
  accentColor: string
}

const PILLARS: PillarItem[] = [
  {
    id: 'competitions',
    title: 'Competições',
    description: 'Campeonatos oficiais, taças nacionais e torneios regionais.',
    href: ROUTES.COMPETITIONS,
    icon: Trophy,
    accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'clubs',
    title: 'Clubes',
    description: 'Equipas, plantéis de jogadores, calendários e histórico.',
    href: ROUTES.CLUBS,
    icon: Shield,
    accentColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'organizations',
    title: 'Organizações',
    description: 'Federações, associações provinciais e ligas desportivas.',
    href: ROUTES.ORGANIZATIONS,
    icon: Building2,
    accentColor: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'players',
    title: 'Jogadores',
    description: 'Perfis de atletas, histórico de carreira e dados de scouting.',
    href: ROUTES.PLAYERS,
    icon: Users,
    accentColor: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
]

function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[76px] rounded-xl border border-outline-variant/10 bg-surface-container/60 p-4 animate-pulse flex items-center gap-3"
        >
          <div className="h-11 w-11 rounded-xl bg-outline-variant/20 shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-2/3 rounded bg-outline-variant/20" />
            <div className="h-3 w-1/3 rounded bg-outline-variant/15" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ExplorePage() {
  useSeo({
    title: 'Explorar o Ecossistema',
    description: 'Descubra competições, clubes, organizações e atletas do futebol em Angola e África.',
    path: ROUTES.PUBLIC_EXPLORE,
  })

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const debouncedSearch = useDebounce(search, 300)

  // 1. Competitions Query
  const { data: compData, isLoading: compLoading } = useCompetitionsPaginated({
    search: debouncedSearch || undefined,
    page: 1,
    page_size: activeCategory === 'competitions' ? 12 : 3,
  })
  const competitions = compData?.results ?? []
  const competitionsTotal = compData?.count ?? competitions.length

  // 2. Clubs Query
  const { data: clubsData, isLoading: clubsLoading } = useClubs({
    search: debouncedSearch || undefined,
    page: 1,
    page_size: activeCategory === 'clubs' ? 12 : 6,
  })
  const clubs = clubsData?.results ?? []
  const clubsTotal = clubsData?.count ?? clubs.length

  // 3. Organizations Query
  const { data: orgsData, isLoading: orgsLoading } = usePublicOrganizations({
    search: debouncedSearch || undefined,
  })
  const rawOrgs = Array.isArray(orgsData) ? orgsData : []
  const organizationsTotal = rawOrgs.length
  const organizations = activeCategory === 'organizations' ? rawOrgs.slice(0, 12) : rawOrgs.slice(0, 3)

  // 4. Players Query
  const { data: playersData, isLoading: playersLoading } = usePlayers({
    search: debouncedSearch && debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    page: 1,
    page_size: activeCategory === 'players' ? 12 : 6,
  })
  const players = playersData?.results ?? []
  const playersTotal = playersData?.count ?? players.length

  const isInitialLoading = compLoading && clubsLoading && orgsLoading

  const hasAnyResults =
    competitions.length > 0 || clubs.length > 0 || organizations.length > 0 || players.length > 0

  const showCompetitions = activeCategory === 'all' || activeCategory === 'competitions'
  const showClubs = activeCategory === 'all' || activeCategory === 'clubs'
  const showOrganizations = activeCategory === 'all' || activeCategory === 'organizations'
  const showPlayers = activeCategory === 'all' || activeCategory === 'players'

  return (
    <ExplorePageShell
      eyebrow="Ecossistema BolaYetu"
      title="Explorar o Futebol em Angola"
      description="Acompanhe competições oficiais, descubra clubes, conheça organizações desportivas e encontre talentos em ascensão num único lugar."
    >
      <div className="space-y-8">
        {/* Search & Category Filter Section */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-4 sm:p-5 shadow-sm space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar competições, clubes, organizações ou jogadores..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high transition-colors"
                aria-label="Limpar pesquisa"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary text-on-primary-fixed shadow-sm'
                  : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Todos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('competitions')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'competitions'
                  ? 'bg-primary text-on-primary-fixed shadow-sm'
                  : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Competições</span>
              {competitionsTotal > 0 && (
                <span className="ml-0.5 rounded-full bg-black/15 px-1.5 py-0.2 text-[10px]">
                  {competitionsTotal}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('clubs')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'clubs'
                  ? 'bg-primary text-on-primary-fixed shadow-sm'
                  : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Clubes</span>
              {clubsTotal > 0 && (
                <span className="ml-0.5 rounded-full bg-black/15 px-1.5 py-0.2 text-[10px]">
                  {clubsTotal}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('organizations')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'organizations'
                  ? 'bg-primary text-on-primary-fixed shadow-sm'
                  : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Organizações</span>
              {organizationsTotal > 0 && (
                <span className="ml-0.5 rounded-full bg-black/15 px-1.5 py-0.2 text-[10px]">
                  {organizationsTotal}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('players')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'players'
                  ? 'bg-primary text-on-primary-fixed shadow-sm'
                  : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Jogadores</span>
              {playersTotal > 0 && (
                <span className="ml-0.5 rounded-full bg-black/15 px-1.5 py-0.2 text-[10px]">
                  {playersTotal}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Nav Pillars (visible only when not searching and viewing 'all') */}
        {!debouncedSearch && activeCategory === 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map(pillar => {
              const Icon = pillar.icon
              return (
                <Link
                  key={pillar.id}
                  to={pillar.href}
                  className="group relative flex flex-col justify-between rounded-xl border border-outline-variant/20 bg-surface-container p-4 transition-all duration-200 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${pillar.accentColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Empty State when search returns no results across active view */}
        {debouncedSearch && !isInitialLoading && !hasAnyResults && (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container/40 p-8 text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Nenhum resultado encontrado</h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              Não encontramos resultados para &ldquo;{debouncedSearch}&rdquo;. Tente pesquisar por outro termo ou explore as categorias.
            </p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary-fixed text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Limpar pesquisa
            </button>
          </div>
        )}

        {/* 1. Competições Section */}
        {showCompetitions && (compLoading || competitions.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Trophy className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-on-surface">Competições</h2>
                {competitionsTotal > 0 && (
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                    {competitionsTotal}
                  </span>
                )}
              </div>
              <Link
                to={ROUTES.COMPETITIONS}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors"
              >
                <span>Ver todas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {compLoading ? (
              <SectionSkeleton count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitions.map(comp => (
                  <CompetitionCard key={comp.id} competition={comp} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. Clubes Section */}
        {showClubs && (clubsLoading || clubs.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Shield className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-on-surface">Clubes</h2>
                {clubsTotal > 0 && (
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                    {clubsTotal}
                  </span>
                )}
              </div>
              <Link
                to={ROUTES.CLUBS}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors"
              >
                <span>Ver todos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {clubsLoading ? (
              <SectionSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubs.map(club => (
                  <ClubCardCompact key={club.id || club.slug} club={club} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Organizações Section */}
        {showOrganizations && (orgsLoading || organizations.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  <Building2 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-on-surface">Organizações</h2>
                {organizationsTotal > 0 && (
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                    {organizationsTotal}
                  </span>
                )}
              </div>
              <Link
                to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors"
              >
                <span>Ver todas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {orgsLoading ? (
              <SectionSkeleton count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map(org => (
                  <OrganizationCardCompact key={org.id || org.slug} organization={org} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Jogadores Section */}
        {showPlayers && (playersLoading || players.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 border border-violet-500/20">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-on-surface">Jogadores</h2>
                {playersTotal > 0 && (
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                    {playersTotal}
                  </span>
                )}
              </div>
              <Link
                to={ROUTES.PLAYERS}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors"
              >
                <span>Ver todos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {playersLoading ? (
              <SectionSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map(player => (
                  <PlayerCardCompact key={player.id || player.slug} player={player} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Ecosystem CTA Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-surface-container p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ecossistema Aberto</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Tem um clube, organização ou projeto desportivo?
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Junte-se à BolaYetu para gerir competições, dar visibilidade ao seu plantel e conectar atletas, treinadores e adeptos com tecnologia de ponta.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary-fixed shadow-sm hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Criar Conta</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={ROUTES.COMPETITIONS}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-high/60 px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span>Ver Competições</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ExplorePageShell>
  )
}
export default ExplorePage

