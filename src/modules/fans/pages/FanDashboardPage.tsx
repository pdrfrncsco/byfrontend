import React, { useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import {
  FanHeroBanner,
  FanUpcomingMatchesCard,
  FanMatchPredictionCard,
  FanFavoritesWidget,
  FanFeedWidget,
  FanLeaderboardCard,
} from '../components'
import { useFanFavorites } from '../hooks/useFanFavorites'
import { getFanSidebarLinks } from '../constants/navigation'
import type { FanMatch } from '../types'

export function FanDashboardPage() {
  const { user } = useAuth()
  const {
    followedClubs,
    followedPlayers,
    upcomingMatches,
    predictions,
    submitPrediction,
    feedItems,
    toggleFeedLike,
    leaderboard,
    stats,
  } = useFanFavorites()

  const [selectedPredictionMatch, setSelectedPredictionMatch] = useState<FanMatch>(
    upcomingMatches[0]
  )

  const userName = user?.username || (user?.email ? user.email.split('@')[0] : 'Adepto')
  const sidebarLinks = getFanSidebarLinks()

  return (
    <DashboardLayout
      title="Meu Futebol"
      subtitle="Acompanhamento personalizado · Clubes, Atletas e Palpites"
      dashboardType="fan"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-6 pb-12">
        {/* Top Hero Banner with stats */}
        <FanHeroBanner userName={userName} stats={stats} />

        {/* Main Grid: Left 2 cols, Right 1 col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Matches */}
            <FanUpcomingMatchesCard
              matches={upcomingMatches}
              predictions={predictions}
              onOpenPrediction={(match) => setSelectedPredictionMatch(match)}
            />

            {/* Live Feed & Highlights */}
            <FanFeedWidget
              feedItems={feedItems}
              onToggleLike={toggleFeedLike}
            />
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Interactive Prediction Widget */}
            <FanMatchPredictionCard
              featuredMatch={selectedPredictionMatch}
              currentPrediction={predictions[selectedPredictionMatch.id]}
              onSubmitPrediction={submitPrediction}
            />

            {/* My Favorites (Clubs & Players) */}
            <FanFavoritesWidget
              followedClubs={followedClubs}
              followedPlayers={followedPlayers}
            />

            {/* Prediction League Leaderboard */}
            <FanLeaderboardCard leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
