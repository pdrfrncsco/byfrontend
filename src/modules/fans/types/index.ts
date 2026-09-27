export interface FollowedItem {
  id: string
  type: 'club' | 'player' | 'competition'
  name: string
  slug?: string
  avatarUrl?: string
  badgeUrl?: string
  subtitle?: string
  category?: string
  followedAt: string
}

export interface FanMatch {
  id: string
  competitionId: string
  competitionName: string
  competitionLogo?: string
  round?: string
  date: string
  time: string
  venue: string
  city?: string
  status: 'scheduled' | 'live' | 'finished'
  homeTeam: {
    id: string
    name: string
    shortName: string
    logoUrl?: string
    score?: number
  }
  awayTeam: {
    id: string
    name: string
    shortName: string
    logoUrl?: string
    score?: number
  }
  minute?: number
  hasFollowedTeam?: boolean
}

export interface FanPrediction {
  matchId: string
  homeScore: number
  awayScore: number
  predictedAt: string
  pointsEarned?: number
  status: 'pending' | 'correct' | 'incorrect'
}

export interface FanFeedItem {
  id: string
  type: 'match_result' | 'highlight' | 'transfer' | 'club_news' | 'award'
  title: string
  summary: string
  entityName: string
  entityLogo?: string
  entityType: 'club' | 'player' | 'competition'
  timestamp: string
  mediaUrl?: string
  actionUrl?: string
  likesCount: number
  hasLiked?: boolean
}

export interface FanLeaderboardUser {
  id: string
  name: string
  avatarUrl?: string
  favoriteClub: string
  favoriteClubLogo?: string
  points: number
  correctPredictions: number
  rank: number
  isCurrentUser?: boolean
}

export interface FanStats {
  followedClubsCount: number
  followedPlayersCount: number
  totalPredictions: number
  correctPredictions: number
  points: number
  rank: number
}
