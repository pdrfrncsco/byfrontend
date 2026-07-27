import { Match, Standing } from '../types'
import { LeagueConfig, TiebreakerRule } from '../types/competition-format.types'

export function calculateStandings(
  matches: Match[],
  clubs: { id: string; name: string; logo: string | null }[],
  config: LeagueConfig
): Standing[] {
  const standingsMap: Record<string, Standing> = {}

  // Initialize all clubs
  clubs.forEach((club) => {
    standingsMap[club.id] = {
      id: club.id,
      competition: matches[0]?.competition || '',
      club: club.id,
      club_name: club.name,
      club_logo: club.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      position: 0,
    }
  })

  // Calculate points and goals from finished matches
  matches.forEach((match) => {
    if (match.status !== 'finished' || match.home_score === null || match.away_score === null) {
      return
    }

    // Ensure standing objects exist
    if (!standingsMap[match.home_club]) {
      standingsMap[match.home_club] = initStanding(match.home_club, match.home_club_name, match.home_club_logo, match.competition)
    }
    if (!standingsMap[match.away_club]) {
      standingsMap[match.away_club] = initStanding(match.away_club, match.away_club_name, match.away_club_logo, match.competition)
    }

    const home = standingsMap[match.home_club]
    const away = standingsMap[match.away_club]

    home.played++
    away.played++

    home.goals_for += match.home_score
    home.goals_against += match.away_score
    away.goals_for += match.away_score
    away.goals_against += match.home_score

    home.goal_difference = home.goals_for - home.goals_against
    away.goal_difference = away.goals_for - away.goals_against

    const ptsWin = config.pointsWin ?? 3
    const ptsDraw = config.pointsDraw ?? 1
    const ptsLoss = config.pointsLoss ?? 0

    if (match.home_score > match.away_score) {
      home.won++
      home.points += ptsWin
      away.lost++
      away.points += ptsLoss
    } else if (match.home_score < match.away_score) {
      away.won++
      away.points += ptsWin
      home.lost++
      home.points += ptsLoss
    } else {
      home.drawn++
      home.points += ptsDraw
      away.drawn++
      away.points += ptsDraw
    }
  })

  const standingsList = Object.values(standingsMap)

  // Sort standings based on tiebreaker rules
  const tiebreakers = config.tiebreakers || [
    'goal_difference',
    'goals_scored',
  ]

  standingsList.sort((a, b) => {
    // Primary: Points (always first)
    if (b.points !== a.points) {
      return b.points - a.points
    }

    // Secondary: tiebreaker rules in order
    for (const rule of tiebreakers) {
      const res = applyRule(rule, a, b, matches)
      if (res !== 0) return res
    }

    // Final fallback: alphabetical
    return a.club_name.localeCompare(b.club_name)
  })

  // Assign positions
  standingsList.forEach((item, index) => {
    item.position = index + 1
  })

  return standingsList
}

function initStanding(clubId: string, name: string, logo: string | null, competitionId: string): Standing {
  return {
    id: clubId,
    competition: competitionId,
    club: clubId,
    club_name: name,
    club_logo: logo,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
    position: 0,
  }
}

function applyRule(rule: TiebreakerRule, a: Standing, b: Standing, matches: Match[]): number {
  switch (rule) {
    case 'goal_difference':
      return b.goal_difference - a.goal_difference

    case 'goals_scored':
      return b.goals_for - a.goals_for

    case 'head_to_head_points': {
      const directMatches = matches.filter(
        (m) =>
          m.status === 'finished' &&
          m.home_score !== null &&
          m.away_score !== null &&
          ((m.home_club === a.club && m.away_club === b.club) ||
            (m.home_club === b.club && m.away_club === a.club))
      )
      let pointsA = 0
      let pointsB = 0
      directMatches.forEach((m) => {
        if (m.home_score! > m.away_score!) {
          if (m.home_club === a.club) pointsA += 3; else pointsB += 3
        } else if (m.home_score! < m.away_score!) {
          if (m.away_club === a.club) pointsA += 3; else pointsB += 3
        } else {
          pointsA += 1
          pointsB += 1
        }
      })
      return pointsB - pointsA
    }

    case 'head_to_head_goal_difference': {
      const directMatches = matches.filter(
        (m) =>
          m.status === 'finished' &&
          m.home_score !== null &&
          m.away_score !== null &&
          ((m.home_club === a.club && m.away_club === b.club) ||
            (m.home_club === b.club && m.away_club === a.club))
      )
      let diffA = 0
      let diffB = 0
      directMatches.forEach((m) => {
        const diff = m.home_score! - m.away_score!
        if (m.home_club === a.club) {
          diffA += diff
          diffB -= diff
        } else {
          diffB += diff
          diffA -= diff
        }
      })
      return diffB - diffA
    }

    case 'fair_play':
      return 0

    case 'random_draw':
    default:
      return 0
  }
}
