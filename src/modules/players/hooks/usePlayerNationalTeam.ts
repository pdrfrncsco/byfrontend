// Players module — National Team hooks
// ⚠️  DISABLED: The backend endpoint /players/{id}/national-team-call-ups/
//     does not exist in urls.py yet. These hooks are stubs that return empty
//     data without making any API call. Re-enable when the endpoint is added.

import { useQuery } from '@tanstack/react-query'
import type {
  NationalTeamCallUp,
  NationalTeamCategory,
  NationalTeamCallUpStatus,
} from '../types'

export type { NationalTeamCallUp, NationalTeamCategory, NationalTeamCallUpStatus }

// ─── Disabled Hooks (return empty data, no API call) ─────────────────────────

export function usePlayerNationalTeamCallUps(_playerId: string, _enabled = true) {
  return useQuery<NationalTeamCallUp[]>({
    queryKey: ['player-national-team-callups-disabled'],
    queryFn: () => Promise.resolve([]),
    enabled: false,
    staleTime: Infinity,
  })
}

/** @deprecated Endpoint not yet available. */
export function useCreateNationalTeamCallUp(_playerId: string) {
  return {
    mutate: () => { console.warn('[useCreateNationalTeamCallUp] Endpoint not implemented in backend yet.') },
    mutateAsync: () => Promise.reject(new Error('Endpoint not implemented in backend yet.')),
    isPending: false,
    isError: false,
    isSuccess: false,
    reset: () => {},
  } as const
}

// ─── Utility Functions (kept for future use) ──────────────────────────────────

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    senior: 'Equipa Sénior',
    u23:    'Sub-23',
    u20:    'Sub-20',
    u17:    'Sub-17',
    u15:    'Sub-15',
  }
  return map[category] ?? category
}

export function getNationalTeamStatusInfo(status: string): {
  label: string; color: string; bgColor: string; icon: string
} {
  const map: Record<string, ReturnType<typeof getNationalTeamStatusInfo>> = {
    called:    { label: 'Chamado',   color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: '📞' },
    released:  { label: 'Libertado', color: 'text-green-700',  bgColor: 'bg-green-100',  icon: '✅' },
    declined:  { label: 'Recusado',  color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '❌' },
    injured:   { label: 'Lesionado', color: 'text-red-700',    bgColor: 'bg-red-100',    icon: '🤕' },
    completed: { label: 'Concluído', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '🎉' },
  }
  return map[status] ?? map['called']
}

export function isCallUpActive(callUp: NationalTeamCallUp): boolean {
  return (
    callUp.status === 'called' &&
    (!callUp.release_date || new Date(callUp.release_date) > new Date())
  )
}

export function getCountryFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function getCountryName(countryCode: string): string {
  const map: Record<string, string> = {
    PRT: 'Portugal', BRA: 'Brasil', FRA: 'França', DEU: 'Alemanha',
    ESP: 'Espanha',  ITA: 'Itália', GBR: 'Reino Unido', ARG: 'Argentina',
    URY: 'Uruguai',  MEX: 'México', USA: 'Estados Unidos', CAN: 'Canadá',
    AUS: 'Austrália', JPN: 'Japão', KOR: 'Coreia do Sul', NLD: 'Holanda',
    BEL: 'Bélgica',  AUT: 'Áustria', SWE: 'Suécia', NOR: 'Noruega',
    DNK: 'Dinamarca', POL: 'Polónia', CZE: 'República Checa', GRC: 'Grécia',
    AGO: 'Angola', MOZ: 'Moçambique', CPV: 'Cabo Verde', GNB: 'Guiné-Bissau',
  }
  return map[countryCode] ?? countryCode
}

export function getCallUpStats(callUp: NationalTeamCallUp): {
  totalMatches: number; goalsPerMatch: number; assistsPerMatch: number
} {
  const totalMatches = callUp.caps
  return {
    totalMatches,
    goalsPerMatch: totalMatches > 0 ? parseFloat((callUp.goals / totalMatches).toFixed(2)) : 0,
    assistsPerMatch: totalMatches > 0 ? parseFloat((callUp.assists / totalMatches).toFixed(2)) : 0,
  }
}
