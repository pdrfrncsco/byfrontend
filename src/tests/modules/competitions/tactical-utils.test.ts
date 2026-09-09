import { describe, expect, it } from 'vitest'
import {
  categorizePlayerPosition,
  validateTacticalFormation,
  generateTacticalPositions,
  SUPPORTED_FORMATIONS,
} from '@/modules/competitions/utils/tactical.utils'
import type { LineupPlayer } from '@/modules/competitions/types'

describe('Tactical Utils', () => {
  it('categorizes player positions correctly', () => {
    expect(categorizePlayerPosition('GK')).toBe('GK')
    expect(categorizePlayerPosition('Guarda-redes')).toBe('GK')
    expect(categorizePlayerPosition('CB')).toBe('DEF')
    expect(categorizePlayerPosition('LB')).toBe('DEF')
    expect(categorizePlayerPosition('RB')).toBe('DEF')
    expect(categorizePlayerPosition('CM')).toBe('MID')
    expect(categorizePlayerPosition('CDM')).toBe('MID')
    expect(categorizePlayerPosition('CAM')).toBe('MID')
    expect(categorizePlayerPosition('ST')).toBe('FWD')
    expect(categorizePlayerPosition('LW')).toBe('FWD')
    expect(categorizePlayerPosition('RW')).toBe('FWD')
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
    const noGk: LineupPlayer[] = Array.from({ length: 11 }, (_, i) => ({
      id: `p-${i}`,
      player_id: `p-${i}`,
      position: 'CM',
      is_goalkeeper: false,
    }))
    const resNoGk = validateTacticalFormation(noGk, '4-3-3')
    expect(resNoGk.isValid).toBe(false)
    expect(resNoGk.errors.some(e => e.includes('exatamente 1 guarda-redes'))).toBe(true)

    // 2 GKs
    const twoGk: LineupPlayer[] = [
      { id: 'gk-1', player_id: 'gk-1', position: 'GK', is_goalkeeper: true },
      { id: 'gk-2', player_id: 'gk-2', position: 'GK', is_goalkeeper: true },
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `p-${i}`,
        player_id: `p-${i}`,
        position: 'CM',
        is_goalkeeper: false,
      })),
    ]
    const resTwoGk = validateTacticalFormation(twoGk, '4-3-3')
    expect(resTwoGk.isValid).toBe(false)
    expect(resTwoGk.errors.some(e => e.includes('não pode ter mais de 1'))).toBe(true)

    // Exactly 1 GK
    const validGk: LineupPlayer[] = [
      { id: 'gk-1', player_id: 'gk-1', position: 'GK', is_goalkeeper: true },
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `p-${i}`,
        player_id: `p-${i}`,
        position: i < 4 ? 'CB' : i < 7 ? 'CM' : 'ST',
        is_goalkeeper: false,
      })),
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
      { id: 'gk-1', playerName: 'Keeper', position: 'GK', is_goalkeeper: true, shirt_number: 1 },
      { id: 'def-1', playerName: 'Def 1', position: 'CB', is_goalkeeper: false, shirt_number: 2 },
      { id: 'def-2', playerName: 'Def 2', position: 'CB', is_goalkeeper: false, shirt_number: 3 },
      { id: 'def-3', playerName: 'Def 3', position: 'LB', is_goalkeeper: false, shirt_number: 4 },
      { id: 'def-4', playerName: 'Def 4', position: 'RB', is_goalkeeper: false, shirt_number: 5 },
      { id: 'mid-1', playerName: 'Mid 1', position: 'CM', is_goalkeeper: false, shirt_number: 6 },
      { id: 'mid-2', playerName: 'Mid 2', position: 'CM', is_goalkeeper: false, shirt_number: 7 },
      { id: 'mid-3', playerName: 'Mid 3', position: 'CAM', is_goalkeeper: false, shirt_number: 8 },
      { id: 'fwd-1', playerName: 'Fwd 1', position: 'LW', is_goalkeeper: false, shirt_number: 9 },
      { id: 'fwd-2', playerName: 'Fwd 2', position: 'ST', is_goalkeeper: false, shirt_number: 10 },
      { id: 'fwd-3', playerName: 'Fwd 3', position: 'RW', is_goalkeeper: false, shirt_number: 11 },
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
})
