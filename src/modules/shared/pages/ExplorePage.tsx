import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { useSeo } from '@/hooks/useSeo'

const destinations = [
  { title: 'Competições', description: 'Descubra provas, calendários e resultados do futebol.', href: ROUTES.COMPETITIONS, icon: 'emoji_events' },
  { title: 'Clubes', description: 'Explore clubes, plantéis e a sua presença no ecossistema.', href: ROUTES.CLUBS, icon: 'shield' },
  { title: 'Organizações', description: 'Conheça as organizações que movimentam o futebol.', href: ROUTES.ORGANIZATIONS, icon: 'business' },
  { title: 'Jogadores', description: 'Encontre perfis, carreiras e talentos em destaque.', href: ROUTES.PLAYERS, icon: 'person_search' },
]

export function ExplorePage() {
  useSeo({
    title: 'Explorar o ecossistema',
    description: 'Explore competições, clubes, organizações e jogadores na BolaYetu.',
    path: ROUTES.PUBLIC_EXPLORE,
  })

  return (
    <section className="mx-auto max-w-container-max px-gutter py-2xl">
      <div className="max-w-2xl">
        <p className="mb-sm text-sm font-bold uppercase tracking-widest text-primary">Ecossistema BolaYetu</p>
        <h1 className="font-display-lg text-4xl leading-tight text-on-surface md:text-6xl">Explore o futebol em Angola e África</h1>
        <p className="mt-md text-lg text-on-surface-variant">Encontre competições, clubes, organizações e jogadores numa experiência pública e acessível.</p>
      </div>
      <div className="mt-2xl grid gap-lg sm:grid-cols-2">
        {destinations.map(destination => (
          <Link key={destination.href} to={destination.href} className="group rounded-2xl border border-outline-variant bg-surface-container-low p-xl transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="mb-xl flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">{destination.icon}</span>
            </span>
            <h2 className="text-xl font-bold text-on-surface group-hover:text-primary">{destination.title}</h2>
            <p className="mt-sm text-sm leading-relaxed text-on-surface-variant">{destination.description}</p>
            <span className="mt-lg inline-flex items-center gap-xs text-sm font-bold text-primary">Explorar <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
