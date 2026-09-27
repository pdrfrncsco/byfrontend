import { useState, useEffect, useCallback, useMemo } from 'react'
import type { FollowedItem, FanPrediction, FanFeedItem, FeedPostComment } from '../types'
import {
  INITIAL_FOLLOWED_ITEMS,
  MOCK_FEED_ITEMS,
  MOCK_UPCOMING_MATCHES,
  MOCK_LEADERBOARD,
  MOCK_FAN_STATS,
} from '../services/mockData'

const STORAGE_KEY_FOLLOWS = 'boayetu_fan_follows_v1'
const STORAGE_KEY_PREDICTIONS = 'boayetu_fan_predictions_v1'
const STORAGE_KEY_FEED_LIKES = 'boayetu_fan_feed_likes_v1'
const STORAGE_KEY_FEED_POSTS = 'boayetu_fan_feed_posts_v1'

export function useFanFavorites() {
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLLOWS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load fan follows from localStorage', e)
    }
    return INITIAL_FOLLOWED_ITEMS
  })

  const [predictions, setPredictions] = useState<Record<string, FanPrediction>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREDICTIONS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load fan predictions from localStorage', e)
    }
    return {
      'match-derby-luanda-01': {
        matchId: 'match-derby-luanda-01',
        homeScore: 2,
        awayScore: 1,
        predictedAt: '2026-09-26T18:00:00Z',
        status: 'pending',
      },
    }
  })

  const [feedItems, setFeedItems] = useState<FanFeedItem[]>(() => {
    try {
      const savedPosts = localStorage.getItem(STORAGE_KEY_FEED_POSTS)
      const baseItems: FanFeedItem[] = savedPosts ? JSON.parse(savedPosts) : MOCK_FEED_ITEMS
      const savedLikes = localStorage.getItem(STORAGE_KEY_FEED_LIKES)
      if (savedLikes) {
        const likedIds = new Set<string>(JSON.parse(savedLikes))
        return baseItems.map((item) => ({
          ...item,
          hasLiked: likedIds.has(item.id),
          likesCount: likedIds.has(item.id) ? (item.hasLiked ? item.likesCount : item.likesCount + 1) : item.likesCount,
        }))
      }
      return baseItems
    } catch (e) {
      console.error('Failed to load feed items', e)
    }
    return MOCK_FEED_ITEMS
  })

  // Sync follows to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(followedItems))
    } catch (e) {
      console.error('Failed to save fan follows to localStorage', e)
    }
  }, [followedItems])

  // Sync predictions to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREDICTIONS, JSON.stringify(predictions))
    } catch (e) {
      console.error('Failed to save fan predictions to localStorage', e)
    }
  }, [predictions])

  // Sync custom feed items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FEED_POSTS, JSON.stringify(feedItems))
    } catch (e) {
      console.error('Failed to save feed posts to localStorage', e)
    }
  }, [feedItems])

  const isFollowing = useCallback(
    (type: 'club' | 'player' | 'competition', idOrSlug: string) => {
      return followedItems.some(
        (item) => item.type === type && (item.id === idOrSlug || item.slug === idOrSlug)
      )
    },
    [followedItems]
  )

  const toggleFollow = useCallback((item: Omit<FollowedItem, 'followedAt'>) => {
    setFollowedItems((prev) => {
      const exists = prev.some(
        (f) => f.type === item.type && (f.id === item.id || (item.slug && f.slug === item.slug))
      )
      if (exists) {
        return prev.filter(
          (f) => !(f.type === item.type && (f.id === item.id || (item.slug && f.slug === item.slug)))
        )
      }
      return [
        ...prev,
        {
          ...item,
          followedAt: new Date().toISOString(),
        },
      ]
    })
  }, [])

  const submitPrediction = useCallback(
    (matchId: string, homeScore: number, awayScore: number) => {
      setPredictions((prev) => ({
        ...prev,
        [matchId]: {
          matchId,
          homeScore,
          awayScore,
          predictedAt: new Date().toISOString(),
          status: 'pending',
        },
      }))
    },
    []
  )

  const toggleFeedLike = useCallback((feedId: string) => {
    setFeedItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== feedId) return item
        const nextLiked = !item.hasLiked
        return {
          ...item,
          hasLiked: nextLiked,
          likesCount: nextLiked ? item.likesCount + 1 : Math.max(0, item.likesCount - 1),
        }
      })
      try {
        const likedIds = updated.filter((i) => i.hasLiked).map((i) => i.id)
        localStorage.setItem(STORAGE_KEY_FEED_LIKES, JSON.stringify(likedIds))
      } catch (e) {
        console.error('Failed to save feed likes', e)
      }
      return updated
    })
  }, [])

  const addFeedComment = useCallback((feedId: string, content: string, authorName = 'Adepto') => {
    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id !== feedId) return item
        const newComment: FeedPostComment = {
          id: `comment-${Date.now()}`,
          authorName,
          authorUsername: authorName.toLowerCase().replace(/\s+/g, '_'),
          content,
          createdAt: 'Agora mesmo',
        }
        const updatedComments = [...(item.comments || []), newComment]
        return {
          ...item,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        }
      })
    )
  }, [])

  const addNewFeedPost = useCallback((newPost: FanFeedItem) => {
    setFeedItems((prev) => [newPost, ...prev])
  }, [])

  const followedClubs = useMemo(
    () => followedItems.filter((i) => i.type === 'club'),
    [followedItems]
  )
  const followedPlayers = useMemo(
    () => followedItems.filter((i) => i.type === 'player'),
    [followedItems]
  )
  const followedCompetitions = useMemo(
    () => followedItems.filter((i) => i.type === 'competition'),
    [followedItems]
  )

  const stats = useMemo(() => {
    return {
      ...MOCK_FAN_STATS,
      followedClubsCount: followedClubs.length,
      followedPlayersCount: followedPlayers.length,
      totalPredictions: Object.keys(predictions).length,
    }
  }, [followedClubs.length, followedPlayers.length, predictions])

  return {
    followedItems,
    followedClubs,
    followedPlayers,
    followedCompetitions,
    isFollowing,
    toggleFollow,
    predictions,
    submitPrediction,
    feedItems,
    toggleFeedLike,
    addFeedComment,
    addNewFeedPost,
    upcomingMatches: MOCK_UPCOMING_MATCHES,
    leaderboard: MOCK_LEADERBOARD,
    stats,
  }
}
