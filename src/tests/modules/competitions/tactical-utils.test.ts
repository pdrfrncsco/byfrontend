import { describe, expect, it } from 'vitest'
import {
  categorizePlayerPosition,
  validateTacticalFormation,
  generateTacticalPositions,
  SUPPORTED_FORMATIONS,
} from '@/modules/competitions/utils/tactical.utils'
import type { LineupPlayer } from '@/modules/competitions/types'

function createMockPlayer(overrides: Partial<LineupPlayer> & { id: string }): LineupPlayer {
  const pos = (overrides.position as any) || 'MF'
  const isGk = overrides.is_goalkeeper ?? (pos === 'GK' || categorizePlayerPosition(pos) === 'GK')
  return {
    ...overrides,
    id: overrides.id,
    playerId: overrides.playerId || overrides.id,
    playerName: overrides.playerName || 'Jogador',
    playerNumber: overrides.playerNumber || overrides.shirt_number || 1,
    position: (pos === 'GK' || pos === 'DF' || pos === 'MF' || pos === 'FW' ? pos : isGk ? 'GK' : 'MF') as any,
    positionSpecific: overrides.positionSpecific || (overrides.position as any),
    eligible: overrides.eligible ?? true,
    player: {
      id: overrides.id,
      full_name: overrides.playerName || 'Jogador',
      position: (overrides.position as any) || 'MF',
    },
    player_id: overrides.player_id || overrides.id,
    status: overrides.status || 'starter',
    shirt_number: overrides.shirt_number || overrides.playerNumber || 1,
    is_captain: overrides.is_captain || false,
    is_goalkeeper: isGk,
  } as LineupPlayer
}

describe('Tactical Utils', () => {
  it('categorizes player positions correctly', () => {
    expect(categorizePlayerPosition('GK')).toBe('GK')
    expect(categorizePlayerPosition('GR')).toBe('GK')
    expect(categorizePlayerPosition('Guarda-redes')).toBe('GK')
    expect(categorizePlayerPosition('Guarda-Redes')).toBe('GK')
    expect(categorizePlayerPosition('GOLO')).toBe('GK')
    expect(categorizePlayerPosition('goalkeeper')).toBe('GK')
    expect(categorizePlayerPosition('CB')).toBe('DEF')
    expect(categorizePlayerPosition('DC')).toBe('DEF')
    expect(categorizePlayerPosition('Defesa Central')).toBe('DEF')
    expect(categorizePlayerPosition('LB')).toBe('DEF')
    expect(categorizePlayerPosition('LE')).toBe('DEF')
    expect(categorizePlayerPosition('RB')).toBe('DEF')
    expect(categorizePlayerPosition('LD')).toBe('DEF')
    expect(categorizePlayerPosition('CM')).toBe('MID')
    expect(categorizePlayerPosition('MC')).toBe('MID')
    expect(categorizePlayerPosition('CDM')).toBe('MID')
    expect(categorizePlayerPosition('MDF')).toBe('MID')
    expect(categorizePlayerPosition('CAM')).toBe('MID')
    expect(categorizePlayerPosition('MCO')).toBe('MID')
    expect(categorizePlayerPosition('ST')).toBe('FWD')
    expect(categorizePlayerPosition('PL')).toBe('FWD')
    expect(categorizePlayerPosition('Ponta de Lança')).toBe('FWD')
    expect(categorizePlayerPosition('CF')).toBe('FWD')
    expect(categorizePlayerPosition('AC')).toBe('FWD')
    expect(categorizePlayerPosition('LW')).toBe('FWD')
    expect(categorizePlayerPosition('EE')).toBe('FWD')
    expect(categorizePlayerPosition('RW')).toBe('FWD')
    expect(categorizePlayerPosition('ED')).toBe('FWD')
    expect(categorizePlayerPosition(undefined)).toBe('MID')
  })

  it('supports all standard tactical formations', () => {
    expect(SUPPORTED_FORMATIONS).toContain('4-4-2')
    expect(SUPPORTED_FORMATIONS).toContain('4-3-3')
    expect(SUPPORTED_FORMATIONS).toContain('4-2-3-1')
    expect(SUPPORTED_FORMATIONS).toContain('3-5-2')
    expect(SUPPORTED_FORMATIONS).toContain('5-3-2')
    expect(SUPPORTED_FORMATIONS).toContain('3-4-3')
    expect(SUPPORTED_FORMATIONS).toContain('4-1-4-1')
    expect(SUPPORTED_FORMATIONS).toContain('4-5-1')
    expect(SUPPORTED_FORMATIONS).toContain('5-4-1')
  })

  it('validates goalkeeper requirement in formation', () => {
    // 0 GKs
    const noGk: LineupPlayer[] = Array.from({ length: 11 }, (_, i) =>
      createMockPlayer({ id: `p-${i}`, position: 'MF', positionSpecific: 'CM', is_goalkeeper: false })
    )
    const resNoGk = validateTacticalFormation(noGk, '4-3-3')
    expect(resNoGk.isValid).toBe(false)
    expect(resNoGk.errors.some((e) => e.includes('exatamente 1 guarda-redes'))).toBe(true)

    // 2 GKs via is_goalkeeper
    const twoGk: LineupPlayer[] = [
      createMockPlayer({ id: 'gk-1', position: 'GK', is_goalkeeper: true }),
      createMockPlayer({ id: 'gk-2', position: 'GK', is_goalkeeper: true }),
      ...Array.from({ length: 9 }, (_, i) =>
        createMockPlayer({ id: `p-${i}`, position: 'MF', positionSpecific: 'CM', is_goalkeeper: false })
      ),
    ]
    const resTwoGk = validateTacticalFormation(twoGk, '4-3-3')
    expect(resTwoGk.isValid).toBe(false)
    expect(resTwoGk.errors.some((e) => e.includes('não pode ter mais de 1'))).toBe(true)

    // 2 GKs via Portuguese position strings without is_goalkeeper flag
    const twoGkText: LineupPlayer[] = [
      createMockPlayer({ id: 'gk-1', position: 'GK', positionSpecific: 'Guarda-Redes', is_goalkeeper: false }),
      createMockPlayer({ id: 'gk-2', position: 'GK', positionSpecific: 'GR', is_goalkeeper: false }),
      ...Array.from({ length: 9 }, (_, i) =>
        createMockPlayer({ id: `p-${i}`, position: 'MF', positionSpecific: 'CM', is_goalkeeper: false })
      ),
    ]
    const resTwoGkText = validateTacticalFormation(twoGkText, '4-3-3')
    expect(resTwoGkText.isValid).toBe(false)
    expect(resTwoGkText.gkCount).toBe(2)
    expect(resTwoGkText.errors.some((e) => e.includes('não pode ter mais de 1'))).toBe(true)

    // Exactly 1 GK
    const validGk: LineupPlayer[] = [
      createMockPlayer({ id: 'gk-1', position: 'GK', is_goalkeeper: true }),
      ...Array.from({ length: 10 }, (_, i) =>
        createMockPlayer({
          id: `p-${i}`,
          position: i < 4 ? 'DF' : i < 7 ? 'MF' : 'FW',
          positionSpecific: i < 4 ? 'CB' : i < 7 ? 'CM' : 'ST',
          is_goalkeeper: false,
        })
      ),
    ]
    const resValid = validateTacticalFormation(validGk, '4-3-3')
    expect(resValid.isValid).toBe(true)
    expect(resValid.errors).toHaveLength(0)
    expect(resValid.gkCount).toBe(1)
    expect(resValid.defCount).toBe(4)
    expect(resValid.midCount).toBe(3)
    expect(resValid.fwdCount).toBe(3)
  })

  it('generates tactical coordinates correctly for home and away teams', () => {
    const starters: LineupPlayer[] = [
      createMockPlayer({ id: 'gk-1', playerName: 'Keeper', position: 'GK', is_goalkeeper: true, shirt_number: 1 }),
      createMockPlayer({ id: 'def-1', playerName: 'Def 1', position: 'DF', positionSpecific: 'CB', shirt_number: 2 }),
      createMockPlayer({ id: 'def-2', playerName: 'Def 2', position: 'DF', positionSpecific: 'CB', shirt_number: 3 }),
      createMockPlayer({ id: 'def-3', playerName: 'Def 3', position: 'DF', positionSpecific: 'LB', shirt_number: 4 }),
      createMockPlayer({ id: 'def-4', playerName: 'Def 4', position: 'DF', positionSpecific: 'RB', shirt_number: 5 }),
      createMockPlayer({ id: 'mid-1', playerName: 'Mid 1', position: 'MF', positionSpecific: 'CM', shirt_number: 6 }),
      createMockPlayer({ id: 'mid-2', playerName: 'Mid 2', position: 'MF', positionSpecific: 'CM', shirt_number: 7 }),
      createMockPlayer({ id: 'mid-3', playerName: 'Mid 3', position: 'MF', positionSpecific: 'CAM', shirt_number: 8 }),
      createMockPlayer({ id: 'fwd-1', playerName: 'Fwd 1', position: 'FW', positionSpecific: 'LW', shirt_number: 9 }),
      createMockPlayer({ id: 'fwd-2', playerName: 'Fwd 2', position: 'FW', positionSpecific: 'ST', shirt_number: 10 }),
      createMockPlayer({ id: 'fwd-3', playerName: 'Fwd 3', position: 'FW', positionSpecific: 'RW', shirt_number: 11 }),
    ]

    const homeTactical = generateTacticalPositions(starters, '4-3-3', true)
    expect(homeTactical).toHaveLength(11)
    // Home GK is on the left side (x around 0.05)
    expect(homeTactical[0].x).toBeCloseTo(0.05, 2)

    const awayTactical = generateTacticalPositions(starters, '4-3-3', false)
    expect(awayTactical).toHaveLength(11)
    // Away GK is on the right side (x around 0.95)
    expect(awayTactical[0].x).toBeCloseTo(0.95, 2)
  })

  it('correctly handles Portuguese abbreviations and full labels in tactical validation', () => {
    const ptLineup: LineupPlayer[] = [
      createMockPlayer({ id: 'p-1', playerName: 'GR 1', position: 'GK', positionSpecific: 'Guarda-Redes', shirt_number: 1 }),
      createMockPlayer({ id: 'p-2', playerName: 'DC 1', position: 'DF', positionSpecific: 'DC', shirt_number: 2 }),
      createMockPlayer({ id: 'p-3', playerName: 'DC 2', position: 'DF', positionSpecific: 'Defesa Central', shirt_number: 3 }),
      createMockPlayer({ id: 'p-4', playerName: 'LE 1', position: 'DF', positionSpecific: 'LE', shirt_number: 4 }),
      createMockPlayer({ id: 'p-5', playerName: 'LD 1', position: 'DF', positionSpecific: 'LD', shirt_number: 5 }),
      createMockPlayer({ id: 'p-6', playerName: 'MDF 1', position: 'MF', positionSpecific: 'MDF', shirt_number: 6 }),
      createMockPlayer({ id: 'p-7', playerName: 'MC 1', position: 'MF', positionSpecific: 'Médio Centro', shirt_number: 7 }),
      createMockPlayer({ id: 'p-8', playerName: 'MCO 1', position: 'MF', positionSpecific: 'MCO', shirt_number: 8 }),
      createMockPlayer({ id: 'p-9', playerName: 'EE 1', position: 'FW', positionSpecific: 'EE', shirt_number: 9 }),
      createMockPlayer({ id: 'p-10', playerName: 'PL 1', position: 'FW', positionSpecific: 'Ponta de Lança', shirt_number: 10 }),
      createMockPlayer({ id: 'p-11', playerName: 'ED 1', position: 'FW', positionSpecific: 'ED', shirt_number: 11 }),
    ]

    const val = validateTacticalFormation(ptLineup, '4-3-3')
    expect(val.isValid).toBe(true)
    expect(val.gkCount).toBe(1)
    expect(val.defCount).toBe(4)
    expect(val.midCount).toBe(3)
    expect(val.fwdCount).toBe(3)

    // Now make MDF an extra GK
    const ptLineupWith2Gk: LineupPlayer[] = [
      ...ptLineup.slice(0, 5),
      createMockPlayer({ id: 'p-extra-gk', playerName: 'GR 2', position: 'GK', positionSpecific: 'Guarda-Redes', shirt_number: 12 }),
      ...ptLineup.slice(6),
    ]
    const val2Gk = validateTacticalFormation(ptLineupWith2Gk, '4-3-3')
    expect(val2Gk.isValid).toBe(false)
    expect(val2Gk.gkCount).toBe(2)
    expect(val2Gk.errors.some((e) => e.includes('não pode ter mais de 1 guarda-redes'))).toBe(true)
  })
})
