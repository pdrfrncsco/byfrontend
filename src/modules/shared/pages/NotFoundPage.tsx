import { Navigation, Footer } from '@/modules/shared/components'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navigation />
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center px-gutter">
          <h1 className="font-display-lg text-6xl md:text-8xl text-on-surface mb-lg uppercase tracking-tighter leading-none">
            404
          </h1>
          <p className="font-title-md text-xl md:text-2xl text-on-surface-variant mb-xl max-w-2xl mx-auto">
            Página não encontrada
          </p>
          <a
            href="/"
            className="inline-block bg-primary text-on-primary-fixed px-xl py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-lg"
          >
            Voltar para Home
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
