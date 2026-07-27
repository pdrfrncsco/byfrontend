export interface RoundRobinMatch {
  home: string;
  away: string;
  round: number;
}

export interface RoundRobinRound {
  number: number;
  matches: RoundRobinMatch[];
}

export function generateRoundRobin(
  teams: string[],
  homeAndAway: boolean
): RoundRobinRound[] {
  if (teams.length === 0) return [];
  
  const list = [...teams];
  if (list.length % 2 !== 0) {
    list.push('BYE');
  }

  const n = list.length;
  const half = n / 2;
  const rounds: RoundRobinRound[] = [];

  for (let round = 0; round < n - 1; round++) {
    const matches: RoundRobinMatch[] = [];
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        // Alternar mandos de campo de forma equilibrada
        if (round % 2 === 0) {
          matches.push({ home, away, round: round + 1 });
        } else {
          matches.push({ home: away, away: home, round: round + 1 });
        }
      }
    }
    rounds.push({ number: round + 1, matches });
    // Rotação: fixar o primeiro elemento, rodar os restantes
    list.splice(1, 0, list.pop()!);
  }

  if (homeAndAway) {
    // Inverter mandos de campo para a segunda volta
    const returnRounds = rounds.map((r, i) => ({
      number: rounds.length + i + 1,
      matches: r.matches.map(m => ({
        home: m.away,
        away: m.home,
        round: rounds.length + i + 1,
      })),
    }));
    return [...rounds, ...returnRounds];
  }

  return rounds;
}
