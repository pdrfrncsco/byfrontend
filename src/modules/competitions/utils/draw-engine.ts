/**
 * Shuffle an array of items using Fisher-Yates algorithm.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Draw teams into groups.
 */
export function drawGroups<T>(
  teams: T[],
  numberOfGroups: number
): T[][] {
  const shuffledTeams = shuffle(teams)
  const groups: T[][] = Array.from({ length: numberOfGroups }, () => [])

  shuffledTeams.forEach((team, index) => {
    const groupIdx = index % numberOfGroups
    groups[groupIdx].push(team)
  })

  return groups
}

/**
 * Draw teams into seeded bracket slots.
 * Seeded: first half of teams are seeds, second half are drawn against seeds.
 */
export function drawSeededCup<T>(
  seeds: T[],
  nonSeeds: T[]
): T[] {
  const shuffledSeeds = shuffle(seeds)
  const shuffledNonSeeds = shuffle(nonSeeds)
  const slots: T[] = []

  const pairsCount = Math.max(shuffledSeeds.length, shuffledNonSeeds.length)
  for (let i = 0; i < pairsCount; i++) {
    if (i < shuffledSeeds.length) slots.push(shuffledSeeds[i])
    if (i < shuffledNonSeeds.length) slots.push(shuffledNonSeeds[i])
  }

  return slots
}
