import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface NationalTeamCallUp {
  id: string
  player: string
  national_team: string
  category: 'senior' | 'u23' | 'u20' | 'u17' | 'u15'
  call_up_date: string
  release_date?: string
  status: 'called' | 'released' | 'declined' | 'injured' | 'completed'
  caps: number
  goals: number
  assists: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateNationalTeamCallUpInput {
  national_team: string
  category: 'senior' | 'u23' | 'u20' | 'u17' | 'u15'
  call_up_date: string
  release_date?: string
  status?: string
  caps?: number
  goals?: number
  assists?: number
  notes?: string
}

/**
 * Hook to fetch national team call-ups for a player
 */
export function usePlayerNationalTeamCallUps(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-national-team-callups', playerId],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/national-team-call-ups/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch national team call-ups: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to create national team call-up
 */
export function useCreateNationalTeamCallUp(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: CreateNationalTeamCallUpInput) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/national-team-call-ups/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to create call-up: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['player-national-team-callups', playerId],
      })
    },
  })
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    senior: 'Equipa Sênior',
    u23: 'Sub-23',
    u20: 'Sub-20',
    u17: 'Sub-17',
    u15: 'Sub-15',
  }

  return categoryMap[category] || category
}

/**
 * Get status info
 */
export function getNationalTeamStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  icon: string
} {
  const statusMap: Record<string, any> = {
    called: {
      label: 'Chamado',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: '📞',
    },
    released: {
      label: 'Libertado',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: '✅',
    },
    declined: {
      label: 'Recusado',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: '❌',
    },
    injured: {
      label: 'Lesionado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: '🤕',
    },
    completed: {
      label: 'Concluído',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      icon: '🎉',
    },
  }

  return statusMap[status] || statusMap['called']
}

/**
 * Check if call-up is active
 */
export function isCallUpActive(callUp: NationalTeamCallUp): boolean {
  return callUp.status === 'called' && (!callUp.release_date || new Date(callUp.release_date) > new Date())
}

/**
 * Get country flag emoji
 */
export function getCountryFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

/**
 * Get country name from ISO code
 */
export function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    PRT: 'Portugal',
    BRA: 'Brasil',
    FRA: 'França',
    DEU: 'Alemanha',
    ESP: 'Espanha',
    ITA: 'Itália',
    GBR: 'Reino Unido',
    ARG: 'Argentina',
    URY: 'Uruguai',
    MEX: 'México',
    USA: 'Estados Unidos',
    CAN: 'Canadá',
    AUS: 'Austrália',
    JPN: 'Japão',
    KOR: 'Coreia do Sul',
    NLD: 'Holanda',
    BEL: 'Bélgica',
    AUT: 'Áustria',
    SWE: 'Suécia',
    NOR: 'Noruega',
    DNK: 'Dinamarca',
    POL: 'Polónia',
    CZE: 'República Checa',
    GRC: 'Grécia',
    PRT: 'Portugal',
  }

  return countryMap[countryCode] || countryCode
}

/**
 * Calculate caps progress
 */
export function getCallUpStats(callUp: NationalTeamCallUp): {
  totalMatches: number
  goalsPerMatch: number
  assistsPerMatch: number
} {
  const totalMatches = callUp.caps
  const goalsPerMatch = totalMatches > 0 ? (callUp.goals / totalMatches).toFixed(2) : 0
  const assistsPerMatch = totalMatches > 0 ? (callUp.assists / totalMatches).toFixed(2) : 0

  return {
    totalMatches,
    goalsPerMatch: parseFloat(String(goalsPerMatch)),
    assistsPerMatch: parseFloat(String(assistsPerMatch)),
  }
}
