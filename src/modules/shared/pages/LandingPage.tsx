import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Navigation,
  HeroSection,
  TrustedBy,
  FeaturesGrid,
  HowItWorks,
  Statistics,
  Ecosystem,
  Pricing,
  Testimonials,
  FAQ,
  Footer,
} from '@/modules/shared/components'
import { useSeo } from '@/hooks/useSeo'

export function LandingPage() {
  const navigate = useNavigate()
  const [showDemoModal, setShowDemoModal] = useState(false)

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

  const handleViewDemo = () => {
    setShowDemoModal(true)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden">
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
      </main>

      {/* Footer */}
      <Footer />

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-gutter">
          <div className="bg-surface-container-high rounded-lg max-w-2xl w-full p-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-display-lg text-headline-lg text-on-surface">Demonstração</h2>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-surface-container rounded-lg flex items-center justify-center mb-lg">
              <span className="text-on-surface-variant">Demonstração de vídeo será exibida aqui</span>
            </div>
            <button
              onClick={() => setShowDemoModal(false)}
              className="w-full bg-primary text-on-primary-fixed font-bold py-md rounded-lg hover:bg-opacity-90 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
