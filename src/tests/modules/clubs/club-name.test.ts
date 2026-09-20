import { describe, it, expect } from 'vitest'
import { formatClubName, formatMatchTeamName } from '@/modules/clubs/utils/club-name'

describe('formatClubName', () => {
  const club = {
    name: 'Atlético Clube Petróleos de Luanda',
    short_name: 'Petro de Luanda',
    acronym: 'APL',
  }

  it('formats official name strictly for official documents', () => {
    expect(formatClubName(club, 'official')).toBe('Atlético Clube Petróleos de Luanda')
  })

  it('formats short name for scoreboards, standings and fixtures', () => {
    expect(formatClubName(club, 'short')).toBe('Petro de Luanda')
    expect(formatClubName(club, 'scoreboard')).toBe('Petro de Luanda')
  })

  it('formats acronym for tickers and compact badges', () => {
    expect(formatClubName(club, 'acronym')).toBe('APL')
    expect(formatClubName(club, 'ticker')).toBe('APL')
  })

  it('handles fallbacks when acronym is missing', () => {
    const withoutAcronym = {
      name: 'Atlético Clube Petróleos de Luanda',
      short_name: 'Petro de Luanda',
      acronym: '',
    }
    expect(formatClubName(withoutAcronym, 'acronym')).toBe('Petro de Luanda')
  })

  it('handles fallbacks when short_name is missing', () => {
    const onlyOfficial = {
      name: 'Atlético Clube Petróleos de Luanda',
      short_name: '',
      acronym: '',
    }
    expect(formatClubName(onlyOfficial, 'short')).toBe('Atlético Clube Petróleos de Luanda')
    expect(formatClubName(onlyOfficial, 'acronym')).toBe('Atlético Clube Petróleos de Luanda')
  })

  it('handles null/undefined club gracefully', () => {
    expect(formatClubName(null, 'short', 'Sem Clube')).toBe('Sem Clube')
    expect(formatClubName(undefined, 'official', '—')).toBe('—')
  })
})

describe('formatMatchTeamName', () => {
  const match = {
    home_club_name: 'Atlético Clube Petróleos de Luanda',
    home_club_short_name: 'Petro de Luanda',
    home_club_acronym: 'APL',
    away_club_name: 'Clube Desportivo Primeiro de Agosto',
    away_club_short_name: '1º de Agosto',
    away_club_acronym: 'PRI',
  }

  it('correctly extracts home team variants', () => {
    expect(formatMatchTeamName(match, 'home', 'official')).toBe('Atlético Clube Petróleos de Luanda')
    expect(formatMatchTeamName(match, 'home', 'short')).toBe('Petro de Luanda')
    expect(formatMatchTeamName(match, 'home', 'ticker')).toBe('APL')
  })

  it('correctly extracts away team variants', () => {
    expect(formatMatchTeamName(match, 'away', 'official')).toBe('Clube Desportivo Primeiro de Agosto')
    expect(formatMatchTeamName(match, 'away', 'short')).toBe('1º de Agosto')
    expect(formatMatchTeamName(match, 'away', 'ticker')).toBe('PRI')
  })
})
