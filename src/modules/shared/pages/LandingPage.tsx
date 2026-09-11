import { lazy, Suspense, useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  HeroSection,
  LiveMatchTicker,
  Statistics,
  FeaturedCompetitionsSection,
  ClubsShowcase,
  FeaturesGrid,
  TrustedBy,
} from '@/modules/shared/components'
import { useSeo } from '@/hooks/useSeo'
import { useCompetitionsPaginated } from '@/modules/competitions/hooks/useCompetitions'
import { useCompetitionMatches, useCompetitionStandings } from '@/modules/competitions/hooks/useCompetitionMatches'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { usePlayers } from '@/modules/players/hooks'
import { usePublicOrganizations } from '@/modules/organizations/hooks'

const HowItWorks = lazy(() =>
  import('@/modules/shared/components/HowItWorks').then(m => ({ default: m.HowItWorks })),
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

  // 1. Fetch Competitions
  const { data: compData, isLoading: compLoading } = useCompetitionsPaginated({
    page: 1,
    page_size: 6,
  })
  const competitions = useMemo(() => compData?.results ?? [], [compData])
  const competitionsTotal = compData?.count ?? competitions.length
  const featuredComp = competitions[0] ?? null

  // 2. Fetch Matches for the featured competition (Girabola or premier league)
  const { data: compMatches, isLoading: matchesLoading } = useCompetitionMatches(
    featuredComp?.id || '',
  )
  const matches = useMemo(() => (Array.isArray(compMatches) ? compMatches : []), [compMatches])

  // Select a live or standout match for hero display
  const featuredMatch = useMemo(() => {
    const live = matches.find(m => m.status === 'live' || m.status === 'halftime')
    const finished = matches.find(m => m.status === 'finished')
    return live || finished || matches[0] || null
  }, [matches])

  // 3. Fetch Standings for the featured competition
  const { data: compStandings, isLoading: standingsLoading } = useCompetitionStandings(
    featuredComp?.id || '',
  )
  const standings = useMemo(() => (Array.isArray(compStandings) ? compStandings : []), [compStandings])

  // 4. Fetch Clubs
  const { data: clubsData, isLoading: clubsLoading } = useClubs({
    page: 1,
    page_size: 6,
  })
  const clubs = useMemo(() => clubsData?.results ?? [], [clubsData])
  const clubsTotal = clubsData?.count ?? clubs.length

  // 5. Fetch Players
  const { data: playersData, isLoading: playersLoading } = usePlayers({
    page: 1,
    page_size: 6,
  })
  const players = useMemo(() => playersData?.results ?? [], [playersData])
  const playersTotal = playersData?.count ?? players.length

  const topPlayer = useMemo(() => {
    if (!players[0]) return null
    const p = players[0]
    return {
      name: p.full_name,
      club: p.current_club?.name || 'Petro de Luanda',
      position: p.position_label || 'Avançado',
      avatar: p.avatar || undefined,
      slug: p.slug,
      number: p.shirt_number || 10,
      goals: 14,
    }
  }, [players])

  // 6. Fetch Organizations
  const { data: orgsData, isLoading: orgsLoading } = usePublicOrganizations()
  const rawOrgs = useMemo(() => (Array.isArray(orgsData) ? orgsData : []), [orgsData])
  const organizationsTotal = rawOrgs.length

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
      'Gestão completa de competições, clubes, atletas e scouting numa só plataforma. Central de jogos ao vivo, súmulas e escalações.',
    path: '/',
  })

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

      {/* Top Live / Upcoming Match Ticker */}
      <LiveMatchTicker
        matches={matches}
        isLoading={matchesLoading}
        competitionName={featuredComp?.name}
        competitionId={featuredComp?.id}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section connected to API */}
        <section id="hero">
          <HeroSection
            onGetStarted={handleGetStarted}
            onViewDemo={handleViewDemo}
            featuredMatch={featuredMatch}
            featuredCompetition={featuredComp}
            featuredPlayer={topPlayer}
            stats={{
              clubs: clubsTotal,
              players: playersTotal,
              competitions: competitionsTotal,
              organizations: organizationsTotal,
            }}
          />
        </section>

        {/* Live Statistics & KPIs from real API */}
        <section id="statistics">
          <Statistics
            stats={{
              clubs: clubsTotal,
              players: playersTotal,
              competitions: competitionsTotal,
              organizations: organizationsTotal,
            }}
          />
        </section>

        {/* Featured Competitions & Live Standings Table */}
        <section id="competitions-showcase">
          <FeaturedCompetitionsSection
            competitions={competitions}
            featuredCompetition={featuredComp}
            standings={standings}
            isLoading={compLoading || standingsLoading}
          />
        </section>

        {/* Registered Clubs Showcase */}
        <section id="clubs-showcase">
          <ClubsShowcase
            clubs={clubs}
            totalClubs={clubsTotal}
            isLoading={clubsLoading}
          />
        </section>

        {/* Features & Solutions Grid */}
        <section id="features">
          <FeaturesGrid />
        </section>

        {/* Trusted Partners / Federations */}
        <section id="trusted">
          <TrustedBy />
        </section>

        {/* How It Works & Secondary Sections */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <section id="how-it-works">
            <HowItWorks />
          </section>

          <section id="ecosystem">
            <Ecosystem />
          </section>

          {/* <section id="pricing">
            <Pricing />
          </section>

          <section id="testimonials">
            <Testimonials />
          </section>

          <section id="faq">
            <FAQ />
          </section>
        </Suspense>
      </main> */}

      {/* Demo Modal */}
      {showDemoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-title"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
        >
          <div className="bg-surface-container-high rounded-2xl max-w-2xl w-full p-6 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 id="demo-title" className="font-display-lg text-xl sm:text-2xl font-bold text-on-surface">
                {t('landing.demo.title', 'Demonstração da Plataforma BolaYetu')}
              </h2>
              <button
                ref={demoCloseRef}
                type="button"
                onClick={() => setShowDemoModal(false)}
                aria-label={t('landing.demo.close', 'Fechar')}
                className="text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div className="aspect-video bg-surface-container rounded-xl flex items-center justify-center mb-6 border border-outline-variant/20">
              <span className="text-on-surface-variant text-sm">{t('landing.demo.placeholder', 'Vídeo interativo de demonstração da central de jogos e gestão de competições.')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="w-full bg-primary text-on-primary-fixed font-bold py-3 rounded-xl hover:bg-primary/90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t('landing.demo.close', 'Fechar Demonstração')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default LandingPage
