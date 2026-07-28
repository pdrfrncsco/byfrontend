import { CupConfig } from '../types/competition-format.types'
import type { MatchStatus } from '../types'

export interface BracketMatch {
  id: string
  team1: string | null
  team1Name?: string | null
  team2: string | null
  team2Name?: string | null
  score1?: number | null
  score2?: number | null
  winner: string | null
  status: MatchStatus
  sourceMatch1?: number
  sourceMatch2?: number
}

export interface BracketRound {
  name: string
  matches: BracketMatch[]
}

function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1
  let p = 1
  while (p < n) {
    p *= 2
  }
  return p
}

export function getRoundName(size: number): string {
  switch (size) {
    case 2:
      return 'Final'
    case 4:
      return 'Meias-Finais'
    case 8:
      return 'Quartos-de-Finais'
    case 16:
      return 'Oitavos-de-Finais'
    case 32:
      return 'Dezasseis-avos-de-Finais'
    default:
      return `Ronda de ${size}`
  }
}

export function generateCupBracket(
  teams: { id: string; name: string }[],
  config: CupConfig
): BracketRound[] {
  const teamList = [...teams]
  const size = nextPowerOfTwo(teamList.length)
  const byes = size - teamList.length
  
  // Fill with null/BYE for power of 2
  const slots: ({ id: string; name: string } | null)[] = [...teamList]
  for (let i = 0; i < byes; i++) {
    slots.push(config.byeAllowed ? null : { id: `BYE-${i}`, name: 'BYE' })
  }

  const currentRoundMatches: BracketMatch[] = []
  for (let i = 0; i < size; i += 2) {
    const t1 = slots[i]
    const t2 = slots[i + 1]
    
    // If t2 is null, t1 automatically wins (BYE)
    const winner = t2 === null && t1 ? t1.id : null
    const status = t2 === null ? 'finished' as const : 'scheduled' as const

    currentRoundMatches.push({
      id: `match-r1-${i / 2}`,
      team1: t1 ? t1.id : null,
      team1Name: t1 ? t1.name : 'BYE',
      team2: t2 ? t2.id : null,
      team2Name: t2 ? t2.name : 'BYE',
      score1: t2 === null && t1 ? 1 : null,
      score2: t2 === null ? 0 : null,
      winner,
      status,
    })
  }

  const rounds: BracketRound[] = [
    {
      name: getRoundName(size),
      matches: currentRoundMatches,
    },
  ]

  let remaining = size / 2
  let roundIdx = 2
  
  while (remaining > 1) {
    remaining /= 2
    const nextMatches: BracketMatch[] = []
    for (let i = 0; i < remaining; i++) {
      nextMatches.push({
        id: `match-r${roundIdx}-${i}`,
        team1: null,
        team1Name: 'A Definir',
        team2: null,
        team2Name: 'A Definir',
        winner: null,
        status: 'scheduled',
        sourceMatch1: i * 2,
        sourceMatch2: i * 2 + 1,
      })
    }
    rounds.push({
      name: getRoundName(remaining * 2),
      matches: nextMatches,
    })
    roundIdx++
  }

  return rounds;
}
