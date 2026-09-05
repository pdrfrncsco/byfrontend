import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/providers'
import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { Competition } from '@/modules/competitions/types'
import { unwrapList } from '@/modules/players/services'

export const clubCompetitionKeys = {
  all: ['club-competitions'] as const,
  detail: (clubId: string) => [...clubCompetitionKeys.all, clubId] as const,
}

export function useClubCompetitions(clubId?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubCompetitionKeys.detail(clubId || ''),
    queryFn: async () => {
      if (!clubId) return []
      const res = await apiClient.get(API_ROUTES.CLUBS.COMPETITIONS(clubId))
      return unwrapList(res.data)
    },
    enabled: isAuthenticated && !!clubId,
  })
}
