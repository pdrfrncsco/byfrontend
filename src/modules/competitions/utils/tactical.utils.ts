import type { LineupPlayer } from '../types'
import type { TacticalPlayer } from '../components/tactical/TacticalField'

// Default formation coordinates (normalized 0..1)
// Home team plays Left -> Right (x: 0.05 to 0.45)
// Away team plays Right -> Left (x: 0.95 to 0.55)

const FORMATION_LAYOUTS: Record<string, { gk: { x: number; y: number }; lines: { count: number; x: number }[] }> = {
  '4-4-2': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.18 }, // DEF: LB, CB, CB, RB
      { count: 4, x: 0.32 }, // MID: LM, CM, CM, RM
      { count: 2, x: 0.44 }, // FWD: ST, ST
    ],
  },
  '4-3-3': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.18 }, // DEF
      { count: 3, x: 0.32 }, // MID
      { count: 3, x: 0.44 }, // FWD
    ],
  },
  '4-2-3-1': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 4, x: 0.16 }, // DEF
      { count: 2, x: 0.27 }, // DM
      { count: 3, x: 0.37 }, // AM
      { count: 1, x: 0.45 }, // ST
    ],
  },
  '3-5-2': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 3, x: 0.18 }, // DEF
      { count: 5, x: 0.32 }, // MID
      { count: 2, x: 0.44 }, // FWD
    ],
  },
  '5-3-2': {
    gk: { x: 0.05, y: 0.5 },
    lines: [
      { count: 5, x: 0.16 }, // DEF
      { count: 3, x: 0.32 }, // MID
      { count: 2, x: 0.44 }, // FWD
    ],
  },
}

function getFormationLayout(formationStr?: string) {
  if (formationStr && FORMATION_LAYOUTS[formationStr]) {
    return FORMATION_LAYOUTS[formationStr]
  }
  // Default to 4-3-3 if unknown
  return FORMATION_LAYOUTS['4-3-3']
}

export function generateTacticalPositions(
  starters: LineupPlayer[],
  formationStr: string = '4-3-3',
  isHomeTeam: boolean = true
): TacticalPlayer[] {
  if (!starters || starters.length === 0) return []

  const layout = getFormationLayout(formationStr)
  
  // Separate GK and field players
  const gk = starters.find((p) => p.is_goalkeeper || p.position === 'GK')
  const fieldPlayers = starters.filter((p) => p !== gk)

  const tacticalPlayers: TacticalPlayer[] = []

  // 1. Goalkeeper
  if (gk) {
    const gkX = isHomeTeam ? layout.gk.x : 1 - layout.gk.x
    const gkY = layout.gk.y
    tacticalPlayers.push({
      id: gk.id || gk.playerId || gk.player_id || 'gk',
      number: gk.shirt_number || gk.playerNumber || 1,
      name: gk.playerName || gk.player?.full_name || 'Guarda-redes',
      x: gkX,
      y: gkY,
    })
  }

  // 2. Field players distributed into formation lines
  let playerIdx = 0
  for (const line of layout.lines) {
    const linePlayers = fieldPlayers.slice(playerIdx, playerIdx + line.count)
    playerIdx += line.count

    const count = linePlayers.length
    if (count === 0) continue

    // Calculate Y coordinates evenly spaced between 0.15 and 0.85
    const stepY = count > 1 ? 0.7 / (count + 1) : 0.35
    const startY = 0.15

    linePlayers.forEach((player, i) => {
      const normX = isHomeTeam ? line.x : 1 - line.x
      const normY = startY + stepY * (i + 1)

      tacticalPlayers.push({
        id: player.id || player.playerId || player.player_id || `player-${playerIdx + i}`,
        number: player.shirt_number || player.playerNumber || playerIdx + i + 2,
        name: player.playerName || player.player?.full_name || 'Jogador',
        x: normX,
        y: normY,
      })
    })
  }

  // Handle any remaining field players beyond formation lines
  while (playerIdx < fieldPlayers.length) {
    const player = fieldPlayers[playerIdx]
    const normX = isHomeTeam ? 0.35 : 0.65
    const normY = 0.5

    tacticalPlayers.push({
      id: player.id || player.playerId || player.player_id || `extra-${playerIdx}`,
      number: player.shirt_number || player.playerNumber || playerIdx + 2,
      name: player.playerName || player.player?.full_name || 'Jogador',
      x: normX,
      y: normY,
    })
    playerIdx++
  }

  return tacticalPlayers
}
