import { ROUTES } from '@/constants'
import { useSeo } from '@/hooks/useSeo'
import { EntityCard, EntityGrid, ExplorePageShell, ExploreSection, ResultCount, SearchToolbar } from '@/modules/shared/components'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const destinations = [
  { title: 'Competições', description: 'Descubra provas, calendários e resultados do futebol.', href: ROUTES.COMPETITIONS, icon: 'emoji_events' },
  { title: 'Clubes', description: 'Explore clubes, plantéis e a sua presença no ecossistema.', href: ROUTES.CLUBS, icon: 'shield' },
  { title: 'Organizações', description: 'Conheça as organizações que movimentam o futebol.', href: ROUTES.ORGANIZATIONS, icon: 'business' },
  { title: 'Jogadores', description: 'Encontre perfis, carreiras e talentos em destaque.', href: ROUTES.PLAYERS, icon: 'person_search' },
]

const journeys = [
  { title: 'Acompanhar uma competição', description: 'Consulte classificação, jogos, estatísticas e regulamentos.', href: ROUTES.COMPETITIONS, icon: 'emoji_events', eyebrow: 'Para adeptos' },
  { title: 'Encontrar um clube', description: 'Conheça a identidade, plantel e atividade pública dos clubes.', href: ROUTES.CLUBS, icon: 'shield', eyebrow: 'Para comunidades' },
  { title: 'Descobrir talento', description: 'Pesquise jogadores por posição, nacionalidade e disponibilidade.', href: ROUTES.PLAYERS, icon: 'person_search', eyebrow: 'Para scouting' },
]

export function ExplorePage() {
  const [query, setQuery] = useState('')
  useSeo({
    title: 'Explorar o ecossistema',
    description: 'Explore competições, clubes, organizações e jogadores na BolaYetu.',
    path: ROUTES.PUBLIC_EXPLORE,
  })

  const filteredDestinations = useMemo(() => destinations.filter(destination => `${destination.title} ${destination.description}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <ExplorePageShell
      eyebrow="Ecossistema BolaYetu"
      title="Explore o futebol em Angola e África"
      description="Encontre competições, clubes, organizações e jogadores numa experiência pública e acessível."
    >
      <ExploreSection title="Descobrir" description="Escolha uma área para começar a explorar.">
        <div className="space-y-lg">
          <SearchToolbar value={query} onChange={setQuery} placeholder="Pesquisar no ecossistema..." />
          <ResultCount count={filteredDestinations.length} label="áreas disponíveis" />
          <EntityGrid>
            {filteredDestinations.map(destination => <EntityCard key={destination.href} href={destination.href} title={destination.title} description={destination.description} icon={destination.icon} />)}
          </EntityGrid>
          {filteredDestinations.length === 0 && <p className="rounded-xl border border-dashed border-outline-variant p-xl text-center text-sm text-on-surface-variant">Nenhuma área corresponde à sua pesquisa.</p>}
        </div>
      </ExploreSection>

      <ExploreSection title="Escolha o seu próximo passo" description="A BolaYetu conecta as pessoas, equipas e competições que fazem o futebol acontecer." className="mt-2xl">
        <EntityGrid columns={3}>
          {journeys.map(journey => <EntityCard key={journey.href} href={journey.href} title={journey.title} description={journey.description} icon={journey.icon} eyebrow={journey.eyebrow} />)}
        </EntityGrid>
      </ExploreSection>

      <section className="mt-2xl overflow-hidden rounded-2xl border border-primary/20 bg-primary-container/20 p-xl md:flex md:items-center md:justify-between md:gap-xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Faça parte do ecossistema</p>
          <h2 className="mt-sm text-2xl font-bold text-on-surface md:text-3xl">Tem um clube, organização ou projeto?</h2>
          <p className="mt-sm text-sm leading-relaxed text-on-surface-variant">Crie o seu perfil e ajude a tornar o futebol africano mais visível, organizado e conectado.</p>
        </div>
        <Link to={ROUTES.REGISTER} className="mt-lg inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-lg py-sm text-sm font-bold text-on-primary-fixed transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:mt-0">Criar conta <span className="material-symbols-outlined ml-xs text-base" aria-hidden="true">arrow_forward</span></Link>
      </section>
    </ExplorePageShell>
  )
}
