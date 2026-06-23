interface HeroSectionProps {
  onGetStarted?: () => void
  onViewDemo?: () => void
}

export function HeroSection({ onGetStarted, onViewDemo }: HeroSectionProps) {
  return (
    <section className="relative min-h-[921px] flex flex-col items-center justify-center pt-xl hero-gradient px-gutter">
      <div className="max-w-4xl text-center z-10">
        {/* Badge */}
        <span className="inline-block py-1 px-4 rounded-full border border-primary/30 bg-primary/5 text-primary font-label-sm text-label-sm mb-md tracking-widest uppercase">
          Tecnologia para o Elite do Futebol
        </span>

        {/* Main Heading */}
        <h1 className="font-display-lg text-6xl md:text-8xl text-on-surface mb-lg uppercase tracking-tighter leading-none">
          Digitalize o <span className="text-primary">Futebol Africano</span>
        </h1>

        {/* Description */}
        <p className="font-title-md text-xl md:text-2xl text-on-surface-variant mb-xl max-w-2xl mx-auto">
          A plataforma unificada que conecta federações, clubes e atletas com tecnologia de ponta para gestão,
          análise e scouting.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-md justify-center mb-20">
          <button
            onClick={onGetStarted}
            className="bg-primary text-on-primary-fixed px-xl py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-lg"
          >
            Começar Agora
          </button>
          <button
            onClick={onViewDemo}
            className="border border-outline-variant text-on-surface px-xl py-md font-bold rounded-lg hover:bg-surface-container-high transition-colors text-lg flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined">play_circle</span> Ver Demonstração
          </button>
        </div>
      </div>

      {/* Dashboard Mockup */}
      <div className="relative w-full max-w-5xl mx-auto px-gutter group">
        <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="relative glass-panel rounded-xl overflow-hidden shadow-2xl border border-outline-variant transform group-hover:-translate-y-2 transition-transform duration-500">
          {/* Browser Bar */}
          <div className="h-8 bg-surface-container-highest border-b border-outline-variant flex items-center px-md gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
          </div>

          <div className="flex h-[500px]">
            {/* Sidebar Mockup */}
            <div className="w-48 bg-surface-container-lowest/50 border-r border-outline-variant p-md space-y-md">
              <div className="h-4 bg-surface-container-highest rounded w-3/4"></div>
              <div className="space-y-sm">
                <div className="h-2 bg-surface-container-highest rounded w-full"></div>
                <div className="h-2 bg-surface-container-highest rounded w-5/6"></div>
                <div className="h-2 bg-surface-container-highest rounded w-full"></div>
              </div>
            </div>

            {/* Content Mockup */}
            <div className="flex-1 p-lg bg-surface-container-lowest/20">
              <div className="grid grid-cols-3 gap-md mb-lg">
                <div className="h-32 bg-primary/5 rounded-lg border border-primary/20"></div>
                <div className="h-32 bg-surface-container-highest/30 rounded-lg border border-outline-variant"></div>
                <div className="h-32 bg-surface-container-highest/30 rounded-lg border border-outline-variant"></div>
              </div>
              <div className="h-64 bg-surface-container-highest/20 rounded-lg border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/40 text-6xl">bar_chart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
