interface EcosystemItem {
  icon: string
  title: string
  description: string
}

const ecosystemItems: EcosystemItem[] = [
  {
    icon: 'groups',
    title: 'Organizações',
    description: 'Gestão de federações, confederações e associações com controlo de permissões granular.',
  },
  {
    icon: 'sports_soccer',
    title: 'Clubes e Equipas',
    description: 'Plataforma centralizada para registos de atletas, calendários e finanças desportivas.',
  },
  {
    icon: 'person',
    title: 'Jogadores & Staff',
    description: 'Perfis profissionais com histórico médico, contratual e estatísticas de performance.',
  },
]

export function Ecosystem() {
  return (
    <section className="py-xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">O Ecossistema BolaYetu</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Conecta todas as partes interessadas numa única plataforma integrada para o futebol africano.
          </p>
        </div>

        {/* Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
          {ecosystemItems.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-xl p-lg hover:border-primary/40 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-lg group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
              </div>
              <h3 className="font-title-md text-xl text-on-surface mb-sm">{item.title}</h3>
              <p className="font-body-md text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
