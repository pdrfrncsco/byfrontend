import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navigation, HeroSection, TrustedBy, FeaturesGrid, Footer } from '@/modules/shared/components'
import { useSeo } from '@/hooks/useSeo'

const HowItWorks = lazy(() =>
  import('@/modules/shared/components/HowItWorks').then(m => ({ default: m.HowItWorks })),
)
const Statistics = lazy(() =>
  import('@/modules/shared/components/Statistics').then(m => ({ default: m.Statistics })),
)
const Ecosystem = lazy(() =>
  import('@/modules/shared/components/Ecosystem').then(m => ({ default: m.Ecosystem })),
)
const Pricing = lazy(() =>
  import('@/modules/shared/components/Pricing').then(m => ({ default: m.Pricing })),
)
const Testimonials = lazy(() =>
  import('@/modules/shared/components/Testimonials').then(m => ({ default: m.Testimonials })),
)
const FAQ = lazy(() =>
  import('@/modules/shared/components/FAQ').then(m => ({ default: m.FAQ })),
)

export function LandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showDemoModal, setShowDemoModal] = useState(false)
  const demoTriggerRef = useRef<HTMLButtonElement | null>(null)
  const demoCloseRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!showDemoModal) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowDemoModal(false)
    }
    demoCloseRef.current?.focus()
    document.addEventListener('keydown', handleKey)
    const { style } = document.body
    const prevOverflow = style.overflow
    style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      style.overflow = prevOverflow
      demoTriggerRef.current?.focus()
    }
  }, [showDemoModal])

  useSeo({
    title: 'O Ecossistema do Futebol em Angola e África',
    description:
      'Gestão completa de competições, clubes, atletas e scouting numa só plataforma. Junte-se ao ecossistema do futebol em Angola e em África.',
    path: '/',
  })

  const handleNavClick = (path: string) => {
    const element = document.querySelector(path)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGetStarted = () => {
    navigate('/register')
  }

  const handleViewDemo = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event?.currentTarget) {
      demoTriggerRef.current = event.currentTarget
    }
    setShowDemoModal(true)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden">
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-md focus:left-md focus:z-[60] focus:bg-primary focus:text-on-primary-fixed focus:px-md focus:py-sm focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        {t('landing.skipToContent', 'Saltar para o conteúdo')}
      </a>

      {/* Navigation */}
      <Navigation onNavClick={handleNavClick} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="hero">
          <HeroSection onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />
        </section>

        {/* Trusted By Section */}
        <section id="trusted">
          <TrustedBy />
        </section>

        {/* Features Grid */}
        <section id="features">
          <FeaturesGrid />
        </section>

        {/* How It Works */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <section id="how-it-works">
            <HowItWorks />
          </section>

          {/* Statistics */}
          <section id="statistics">
            <Statistics />
          </section>

          {/* Ecosystem */}
          <section id="ecosystem">
            <Ecosystem />
          </section>

          {/* Pricing */}
          <section id="pricing">
            <Pricing />
          </section>

          {/* Testimonials */}
          <section id="testimonials">
            <Testimonials />
          </section>

          {/* FAQ */}
          <section id="faq">
            <FAQ />
          </section>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Demo Modal */}
      {showDemoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-gutter"
        >
          <div className="bg-surface-container-high rounded-lg max-w-2xl w-full p-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-md">
              <h2 id="demo-title" className="font-display-lg text-headline-lg text-on-surface">
                {t('landing.demo.title')}
              </h2>
              <button
                ref={demoCloseRef}
                type="button"
                onClick={() => setShowDemoModal(false)}
                aria-label={t('landing.demo.close')}
                className="text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div className="aspect-video bg-surface-container rounded-lg flex items-center justify-center mb-lg">
              <span className="text-on-surface-variant">{t('landing.demo.placeholder')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="w-full bg-primary text-on-primary-fixed font-bold py-md rounded-lg hover:bg-opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t('landing.demo.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
