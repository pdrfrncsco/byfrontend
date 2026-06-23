interface Stat {
  value: string
  label: string
}

const stats: Stat[] = [
  {
    value: '1,200+',
    label: 'Clubes Registados',
  },
  {
    value: '45,000+',
    label: 'Jogadores Verificados',
  },
  {
    value: '10+',
    label: 'Federações',
  },
]

export function Statistics() {
  return (
    <section className="py-20 relative">
      <div className="max-w-container-max mx-auto px-gutter relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <p className="font-display-lg text-6xl text-primary mb-sm">{stat.value}</p>
              <p className="font-title-md text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
