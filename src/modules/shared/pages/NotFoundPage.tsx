import { Navigation, Footer } from '@/modules/shared/components'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { useSeo } from '@/hooks/useSeo'

export function NotFoundPage() {
  useSeo({ title: 'Página não encontrada', noIndex: true })
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navigation variant="explore" />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center pt-16">
        <div className="text-center px-gutter">
          <h1 className="font-display-lg text-6xl md:text-8xl text-on-surface mb-lg uppercase tracking-tighter leading-none">
            404
          </h1>
          <p className="font-title-md text-xl md:text-2xl text-on-surface-variant mb-xl max-w-2xl mx-auto">
            Página não encontrada
          </p>
          <Link
            to={ROUTES.HOME}
            className="inline-block bg-primary text-on-primary-fixed px-xl py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-lg"
          >
            Voltar para Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
