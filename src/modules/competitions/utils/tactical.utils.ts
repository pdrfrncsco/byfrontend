import type { LineupPlayer } from '../types'
import type { TacticalPlayer } from '../components/tactical/TacticalField'

// Default formation coordinates (normalized 0..1)
// Home team plays Left -> Right (x: 0.05 to 0.45)
// Away team plays Right -> Left (x: 0.95 to 0.55)

export const FORMATION_LAYOUTS: Record<
  string,
  { gk: { x: number; y: number }; lines: { count: number; x: number; role?: 'DEF' | 'MID' | 'FWD' }[] }
> = {
  '4-4-2': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.18, role: 'DEF' },
      { count: 4, x: 0.32, role: 'MID' },
      { count: 2, x: 0.44, role: 'FWD' },
    ],
  },
  '4-3-3': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.18, role: 'DEF' },
      { count: 3, x: 0.32, role: 'MID' },
      { count: 3, x: 0.44, role: 'FWD' },
    ],
  },
  '4-2-3-1': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.16, role: 'DEF' },
      { count: 2, x: 0.27, role: 'MID' },
      { count: 3, x: 0.37, role: 'MID' },
      { count: 1, x: 0.45, role: 'FWD' },
    ],
  },
  '3-5-2': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 3, x: 0.18, role: 'DEF' },
      { count: 5, x: 0.32, role: 'MID' },
      { count: 2, x: 0.44, role: 'FWD' },
    ],
  },
  '5-3-2': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 5, x: 0.16, role: 'DEF' },
      { count: 3, x: 0.32, role: 'MID' },
      { count: 2, x: 0.44, role: 'FWD' },
    ],
  },
  '3-4-3': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 3, x: 0.18, role: 'DEF' },
      { count: 4, x: 0.32, role: 'MID' },
      { count: 3, x: 0.44, role: 'FWD' },
    ],
  },
  '4-1-4-1': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.16, role: 'DEF' },
      { count: 1, x: 0.25, role: 'MID' },
      { count: 4, x: 0.36, role: 'MID' },
      { count: 1, x: 0.45, role: 'FWD' },
    ],
  },
  '4-5-1': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.18, role: 'DEF' },
      { count: 5, x: 0.32, role: 'MID' },
      { count: 1, x: 0.44, role: 'FWD' },
    ],
  },
  '5-4-1': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 5, x: 0.16, role: 'DEF' },
      { count: 4, x: 0.32, role: 'MID' },
      { count: 1, x: 0.44, role: 'FWD' },
    ],
  },
}

export const SUPPORTED_FORMATIONS = Object.keys(FORMATION_LAYOUTS)

const GK_CODES = new Set(['gk', 'gr', 'golo', 'goalkeeper', 'porteiro'])
const DEF_CODES = new Set(['cb', 'dc', 'lb', 'le', 'rb', 'ld', 'lwb', 'rwb', 'df', 'def'])
const MID_CODES = new Set(['cm', 'mc', 'cdm', 'mdf', 'cam', 'mco', 'mo', 'lm', 'me', 'rm', 'md', 'mf', 'mid'])
const FWD_CODES = new Set(['st', 'pl', 'cf', 'ac', 'fw', 'fwd', 'att', 'lw', 'ee', 'rw', 'ed'])

export function categorizePlayerPosition(pos?: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (!pos) return 'MID'
  const p = pos.trim().toLowerCase()

  // 1. Direct exact match on known codes
  if (GK_CODES.has(p)) return 'GK'
  if (DEF_CODES.has(p)) return 'DEF'
  if (MID_CODES.has(p)) return 'MID'
  if (FWD_CODES.has(p)) return 'FWD'

  // 2. Goalkeeper descriptive strings
  if (p.includes('guarda') || p.includes('keeper') || p.includes('goleiro')) return 'GK'

  // 3. Defence descriptive strings
  if (
    p.includes('defesa') ||
    p.includes('lateral') ||
    p.includes('zagueiro') ||
    p.includes('ala') ||
    p.includes('central')
  ) {
    return 'DEF'
  }

  // 4. Forward / Attack descriptive strings
  if (
    p.includes('avançad') ||
    p.includes('avancad') ||
    p.includes('atacante') ||
    p.includes('ponta') ||
    p.includes('extremo') ||
    p.includes('striker') ||
    p.includes('forward')
  ) {
    return 'FWD'
  }

  // 5. Midfield descriptive strings
  if (
    p.includes('médio') ||
    p.includes('medio') ||
    p.includes('meio') ||
    p.includes('volante') ||
    p.includes('midfield')
  ) {
    return 'MID'
  }

  return 'MID'
}

export function toLineupPosition(pos?: string): 'GK' | 'DF' | 'MF' | 'FW' {
  const cat = categorizePlayerPosition(pos)
  if (cat === 'DEF') return 'DF'
  if (cat === 'MID') return 'MF'
  if (cat === 'FWD') return 'FW'
  return 'GK'
}

export interface FormationValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  gkCount: number
  defCount: number
  midCount: number
  fwdCount: number
  totalStarters: number
}

export function validateTacticalFormation(
  starters: LineupPlayer[] = [],
  formationStr: string = '4-3-3'
): FormationValidationResult {
  let gkCount = 0
  let defCount = 0
  let midCount = 0
  let fwdCount = 0

  starters.forEach(p => {
    const rawPos = p.positionSpecific || p.position
    if (p.is_goalkeeper || categorizePlayerPosition(rawPos) === 'GK') {
      gkCount++
    } else {
      const cat = categorizePlayerPosition(rawPos)
      if (cat === 'DEF') defCount++
      else if (cat === 'MID') midCount++
      else if (cat === 'FWD') fwdCount++
    }
  })

  const totalStarters = starters.length
  const errors: string[] = []
  const warnings: string[] = []

  // Check goalkeeper requirement
  if (gkCount === 0) {
    errors.push('A equipa titular precisa de exatamente 1 guarda-redes (nenhum selecionado).')
  } else if (gkCount > 1) {
    errors.push(`A equipa titular não pode ter mais de 1 guarda-redes (${gkCount} selecionados).`)
  }

  // Check total starters
  if (totalStarters !== 11) {
    warnings.push(`A equipa titular tem ${totalStarters} jogadores (o padrão regulamentar é 11).`)
  }

  // Check formation line distribution
  const layout = FORMATION_LAYOUTS[formationStr]
  if (layout) {
    let targetDef = 0
    let targetMid = 0
    let targetFwd = 0

    layout.lines.forEach(line => {
      if (line.role === 'DEF') targetDef += line.count
      else if (line.role === 'MID') targetMid += line.count
      else if (line.role === 'FWD') targetFwd += line.count
    })

    if (targetDef > 0 && defCount !== targetDef) {
      warnings.push(`Formação ${formationStr} prevê ${targetDef} defesas (atualmente: ${defCount}).`)
    }
    if (targetMid > 0 && midCount !== targetMid) {
      warnings.push(`Formação ${formationStr} prevê ${targetMid} médios (atualmente: ${midCount}).`)
    }
    if (targetFwd > 0 && fwdCount !== targetFwd) {
      warnings.push(`Formação ${formationStr} prevê ${targetFwd} avançados (atualmente: ${fwdCount}).`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    gkCount,
    defCount,
    midCount,
    fwdCount,
    totalStarters,
  }
}

export function getFormationLayout(formationStr?: string) {
  if (formationStr && FORMATION_LAYOUTS[formationStr]) {
    return FORMATION_LAYOUTS[formationStr]
  }
  return FORMATION_LAYOUTS['4-3-3']
}

export function generateTacticalPositions(
  starters: LineupPlayer[],
  formationStr: string = '4-3-3',
  isHomeTeam: boolean = true
): TacticalPlayer[] {
  if (!starters || starters.length === 0) return []

  const layout = getFormationLayout(formationStr)

  // Classify players into positional pools
  const gks: LineupPlayer[] = []
  const defs: LineupPlayer[] = []
  const mids: LineupPlayer[] = []
  const fwds: LineupPlayer[] = []

  starters.forEach(p => {
    const rawPos = p.positionSpecific || p.position
    if (p.is_goalkeeper || categorizePlayerPosition(rawPos) === 'GK') {
      gks.push(p)
    } else {
      const cat = categorizePlayerPosition(rawPos)
      if (cat === 'DEF') defs.push(p)
      else if (cat === 'MID') mids.push(p)
      else fwds.push(p)
    }
  })

  const tacticalPlayers: TacticalPlayer[] = []

  // 1. Goalkeeper(s)
  gks.forEach((gk, i) => {
    const gkX = isHomeTeam ? layout.gk.x : 1 - layout.gk.x
    const gkY = gks.length === 1 ? layout.gk.y : 0.35 + i * 0.3
    tacticalPlayers.push({
      id: gk.id || gk.playerId || gk.player_id || `gk-${i}`,
      number: gk.shirt_number || gk.playerNumber || 1,
      name: gk.playerName || gk.player?.full_name || 'Guarda-redes',
      x: gkX,
      y: gkY,
    })
  })

  // 2. Field lines based on layout roles
  const remainingFieldPlayers = [...defs, ...mids, ...fwds]
  let fieldIdx = 0

  for (const line of layout.lines) {
    let pool: LineupPlayer[] = []
    if (line.role === 'DEF') {
      pool = defs.splice(0, line.count)
    } else if (line.role === 'MID') {
      pool = mids.splice(0, line.count)
    } else if (line.role === 'FWD') {
      pool = fwds.splice(0, line.count)
    }

    // If pool has fewer players than line needs, borrow from remaining
    while (pool.length < line.count && (defs.length > 0 || mids.length > 0 || fwds.length > 0)) {
      const next = defs.shift() || mids.shift() || fwds.shift()
      if (next) pool.push(next)
    }

    const count = pool.length
    if (count === 0) continue

    const stepY = count > 1 ? 0.7 / (count + 1) : 0.35
    const startY = 0.15

    pool.forEach((player, i) => {
      const normX = isHomeTeam ? line.x : 1 - line.x
      const normY = startY + stepY * (i + 1)

      tacticalPlayers.push({
        id: player.id || player.playerId || player.player_id || `player-${fieldIdx + i}`,
        number: player.shirt_number || player.playerNumber || fieldIdx + i + 2,
        name: player.playerName || player.player?.full_name || 'Jogador',
        x: normX,
        y: normY,
      })
    })
    fieldIdx += count
  }

  // Any remaining unplaced players
  const leftover = [...defs, ...mids, ...fwds]
  leftover.forEach((player, i) => {
    const normX = isHomeTeam ? 0.35 : 0.65
    const normY = 0.2 + i * 0.15
    tacticalPlayers.push({
      id: player.id || player.playerId || player.player_id || `extra-${i}`,
      number: player.shirt_number || player.playerNumber || fieldIdx + i + 2,
      name: player.playerName || player.player?.full_name || 'Jogador',
      x: normX,
      y: normY,
    })
  })

  return tacticalPlayers
}
