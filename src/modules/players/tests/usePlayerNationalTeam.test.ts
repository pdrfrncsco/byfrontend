import { describe, it, expect } from 'vitest'
import {
  getCategoryLabel,
  getNationalTeamStatusInfo,
  getCountryName,
  getCountryFlagEmoji,
  getCallUpStats,
  isCallUpActive,
  type NationalTeamCallUp,
} from '../hooks/usePlayerNationalTeam'

describe('usePlayerNationalTeam helpers', () => {
  describe('getCategoryLabel', () => {
    it('should return label for senior category', () => {
      expect(getCategoryLabel('senior')).toBe('Equipa Sênior')
    })

    it('should return label for u23 category', () => {
      expect(getCategoryLabel('u23')).toBe('Sub-23')
    })

    it('should return label for u20 category', () => {
      expect(getCategoryLabel('u20')).toBe('Sub-20')
    })

    it('should return label for u17 category', () => {
      expect(getCategoryLabel('u17')).toBe('Sub-17')
    })

    it('should return label for u15 category', () => {
      expect(getCategoryLabel('u15')).toBe('Sub-15')
    })

    it('should return original for unknown category', () => {
      expect(getCategoryLabel('unknown')).toBe('unknown')
    })
  })

  describe('getNationalTeamStatusInfo', () => {
    it('should return info for called status', () => {
      const result = getNationalTeamStatusInfo('called')
      expect(result).toEqual({
        label: 'Chamado',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '📞',
      })
    })

    it('should return info for released status', () => {
      const result = getNationalTeamStatusInfo('released')
      expect(result.label).toBe('Libertado')
      expect(result.icon).toBe('✅')
    })

    it('should return info for injured status', () => {
      const result = getNationalTeamStatusInfo('injured')
      expect(result.label).toBe('Lesionado')
      expect(result.icon).toBe('🤕')
    })
  })

  describe('getCountryName', () => {
    it('should return country name for valid code', () => {
      expect(getCountryName('PRT')).toBe('Portugal')
      expect(getCountryName('BRA')).toBe('Brasil')
      expect(getCountryName('FRA')).toBe('França')
    })

    it('should return code for unknown country', () => {
      expect(getCountryName('XXX')).toBe('XXX')
    })
  })

  describe('getCountryFlagEmoji', () => {
    it('should return flag emoji for country code', () => {
      const flag = getCountryFlagEmoji('PRT')
      expect(flag).toBeTruthy()
      expect(flag.length).toBeGreaterThan(0)
    })

    it('should handle lowercase codes', () => {
      const flag = getCountryFlagEmoji('pt')
      expect(flag).toBeTruthy()
    })
  })

  describe('getCallUpStats', () => {
    it('should calculate stats for call-up with matches', () => {
      const callUp: NationalTeamCallUp = {
        id: '1',
        player: 'player-1',
        national_team: 'PRT',
        category: 'senior',
        call_up_date: '2024-01-01',
        status: 'called',
        caps: 10,
        goals: 5,
        assists: 3,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const stats = getCallUpStats(callUp)
      expect(stats.totalMatches).toBe(10)
      expect(stats.goalsPerMatch).toBe(0.5)
      expect(stats.assistsPerMatch).toBe(0.3)
    })

    it('should handle zero caps', () => {
      const callUp: NationalTeamCallUp = {
        id: '1',
        player: 'player-1',
        national_team: 'PRT',
        category: 'senior',
        call_up_date: '2024-01-01',
        status: 'called',
        caps: 0,
        goals: 0,
        assists: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const stats = getCallUpStats(callUp)
      expect(stats.totalMatches).toBe(0)
      expect(stats.goalsPerMatch).toBe(0)
      expect(stats.assistsPerMatch).toBe(0)
    })
  })

  describe('isCallUpActive', () => {
    it('should return true for called status without release date', () => {
      const callUp: NationalTeamCallUp = {
        id: '1',
        player: 'player-1',
        national_team: 'PRT',
        category: 'senior',
        call_up_date: '2024-01-01',
        status: 'called',
        caps: 0,
        goals: 0,
        assists: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isCallUpActive(callUp)).toBe(true)
    })

    it('should return true for called status with future release date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)

      const callUp: NationalTeamCallUp = {
        id: '1',
        player: 'player-1',
        national_team: 'PRT',
        category: 'senior',
        call_up_date: '2024-01-01',
        release_date: futureDate.toISOString(),
        status: 'called',
        caps: 0,
        goals: 0,
        assists: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isCallUpActive(callUp)).toBe(true)
    })

    it('should return false for released status', () => {
      const callUp: NationalTeamCallUp = {
        id: '1',
        player: 'player-1',
        national_team: 'PRT',
        category: 'senior',
        call_up_date: '2024-01-01',
        release_date: '2024-01-10',
        status: 'released',
        caps: 0,
        goals: 0,
        assists: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isCallUpActive(callUp)).toBe(false)
    })

    it('should return false for called status with past release date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)

      const callUp: NationalTeamCallUp = {
        id: '1',
        player: 'player-1',
        national_team: 'PRT',
        category: 'senior',
        call_up_date: '2024-01-01',
        release_date: pastDate.toISOString(),
        status: 'called',
        caps: 0,
        goals: 0,
        assists: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isCallUpActive(callUp)).toBe(false)
    })
  })
})
