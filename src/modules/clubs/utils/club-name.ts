/**
 * BOLAYETU — Club Name Formatting Utility
 *
 * Provides consistent formatting across official documents, scoreboards,
 * standings tables, tickers, and player listings.
 *
 * Rules:
 *   - 'official': Strictly the official full name (e.g. 'Atlético Clube Petróleos de Luanda').
 *                 Exclusively used in official documents, contracts, referee reports / match sheets.
 *   - 'short' / 'scoreboard': The standard common name (e.g. 'Petro de Luanda').
 *                 Used in scoreboards, fixtures, standings tables, player profiles.
 *   - 'acronym' / 'ticker': The 2-5 letter abbreviation (e.g. 'APL').
 *                 Used in compact tickers, mini scoreboards, and badge fallbacks.
 */

export type ClubNameVariant = 'official' | 'short' | 'acronym' | 'scoreboard' | 'ticker'

export interface ClubNameFields {
  name?: string | null
  short_name?: string | null
  acronym?: string | null
}

export function formatClubName(
  club?: ClubNameFields | null,
  variant: ClubNameVariant = 'short',
  fallback: string = ''
): string {
  if (!club) return fallback

  const officialName = club.name?.trim() || ''
  const shortName = club.short_name?.trim() || ''
  const acronym = club.acronym?.trim() || ''

  switch (variant) {
    case 'official':
      return officialName || shortName || acronym || fallback

    case 'acronym':
    case 'ticker':
      return acronym || shortName || officialName || fallback

    case 'short':
    case 'scoreboard':
    default:
      return shortName || officialName || acronym || fallback
  }
}

/**
 * Helper to format home or away club name from a Match fixture.
 */
export function formatMatchTeamName(
  match?: Record<string, any> | null,
  side: 'home' | 'away' = 'home',
  variant: ClubNameVariant = 'short',
  fallback?: string
): string {
  if (!match) return fallback || (side === 'home' ? 'Casa' : 'Fora')

  const defaultFallback = fallback || (side === 'home' ? 'Casa' : 'Fora')

  const isHome = side === 'home'
  const officialName = isHome
    ? match.home_club_name || match.homeTeamName
    : match.away_club_name || match.awayTeamName

  const shortName = isHome
    ? match.home_club_short_name || match.homeTeamShortName || match.home_short_name
    : match.away_club_short_name || match.awayTeamShortName || match.away_short_name

  const acronym = isHome
    ? match.home_club_acronym || match.homeTeamAcronym || match.home_acronym
    : match.away_club_acronym || match.awayTeamAcronym || match.away_acronym

  return formatClubName(
    {
      name: officialName,
      short_name: shortName,
      acronym: acronym,
    },
    variant,
    defaultFallback
  )
}
