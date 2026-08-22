import { ROUTES } from '@/constants'
import { useSeo } from '@/hooks/useSeo'
import { EntityCard, EntityGrid, ExplorePageShell, ExploreSection, ResultCount, SearchToolbar } from '@/modules/shared/components'
import { useMemo, useState } from 'react'

const destinations = [
  { title: 'Competições', description: 'Descubra provas, calendários e resultados do futebol.', href: ROUTES.COMPETITIONS, icon: 'emoji_events' },
  { title: 'Clubes', description: 'Explore clubes, plantéis e a sua presença no ecossistema.', href: ROUTES.CLUBS, icon: 'shield' },
  { title: 'Organizações', description: 'Conheça as organizações que movimentam o futebol.', href: ROUTES.ORGANIZATIONS, icon: 'business' },
  { title: 'Jogadores', description: 'Encontre perfis, carreiras e talentos em destaque.', href: ROUTES.PLAYERS, icon: 'person_search' },
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
    </ExplorePageShell>
  )
}
