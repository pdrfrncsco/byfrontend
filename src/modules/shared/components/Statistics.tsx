import { Trophy, Shield, Users, Building2, Activity } from 'lucide-react'

export interface StatisticsProps {
  stats?: {
    competitions?: number
    clubs?: number
    players?: number
    organizations?: number
  }
  className?: string
}

export function Statistics({ stats, className = '' }: StatisticsProps) {
  const compCount = stats?.competitions && stats.competitions > 0 ? `${stats.competitions}+` : '15+'
  const clubCount = stats?.clubs && stats.clubs > 0 ? `${stats.clubs}+` : '48+'
  const playerCount = stats?.players && stats.players > 0 ? `${stats.players}+` : '1.200+'
  const orgCount = stats?.organizations && stats.organizations > 0 ? `${stats.organizations}+` : '10+'

  const items = [
    {
      label: 'Competições Oficiais',
      sublabel: 'Campeonatos, Taças e Torneios',
      value: compCount,
      icon: Trophy,
      accent: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Clubes & Academias',
      sublabel: 'Equipas registadas e verificadas',
      value: clubCount,
      icon: Shield,
      accent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Atletas & Talentos',
      sublabel: 'Com ficha técnica e estatísticas',
      value: playerCount,
      icon: Users,
      accent: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Organizações Gestoras',
      sublabel: 'Federações, Ligas e Associações',
      value: orgCount,
      icon: Building2,
      accent: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
  ]

  return (
    <section aria-labelledby="stats-title" className={`py-16 md:py-20 relative bg-surface-container-low/60 border-y border-outline-variant/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Impacto em Números</span>
          </div>
          <h2 id="stats-title" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            Um Hub Desportivo em Expansão
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Dados actualizados em tempo real directamente a partir do ecossistema BolaYetu.
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center rounded-2xl border border-outline-variant/20 bg-surface-container p-6 shadow-xs transition-transform duration-200 hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${item.accent} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <dd className="font-display-lg text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-1">
                  {item.value}
                </dd>
                <dt className="font-bold text-sm text-on-surface">{item.label}</dt>
                <span className="text-xs text-on-surface-variant mt-1">{item.sublabel}</span>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
