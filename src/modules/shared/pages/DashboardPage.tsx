import { Navigation, Footer } from '@/modules/shared/components'

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navigation />
      <main className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="text-center mb-xl">
          <h1 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">Dashboard</h1>
          <p className="font-body-md text-on-surface-variant">Bem-vindo ao BolaYetu!</p>
        </div>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="glass-panel rounded-xl p-lg border border-outline-variant">
              <div className="h-20 bg-surface-container-highest/40 rounded mb-md"></div>
              <p className="font-title-md text-on-surface">Card {idx}</p>
              <p className="font-body-md text-on-surface-variant">Placeholder content</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
