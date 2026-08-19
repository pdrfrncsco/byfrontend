import { describe, expect, it } from 'vitest'
import { competitionRoutes } from '@/modules/competitions/routes'

describe('competitionRoutes', () => {
  it('provides dedicated MatchCenter hub routes', () => {
    expect(competitionRoutes.matchCenterHub('comp-1')).toBe('/competitions/comp-1/match-center')
    expect(competitionRoutes.adminMatchCenterHub('comp-1')).toBe('/dashboard/competitions/comp-1/match-center')
  })

  it('provides canonical match detail routes', () => {
    expect(competitionRoutes.matchDetail('comp-1', 'match-1')).toBe('/competitions/comp-1/matches/match-1')
    expect(competitionRoutes.adminMatchDetail('comp-1', 'match-1')).toBe('/dashboard/competitions/comp-1/matches/match-1')
  })
})
