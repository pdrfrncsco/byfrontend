/**
 * BOLAYETU — Player Categories & Gender Constants
 *
 * Official federation categories and gender mappings for football players, clubs, and competitions.
 */

export interface DefaultCategoryDef {
  name: string
  slug: string
  minAge?: number
  maxAge?: number
  displayOrder: number
  description: string
  gender: 'male' | 'female' | 'mixed'
}

export const FEDERATION_DEFAULT_CATEGORIES: DefaultCategoryDef[] = [
  { name: 'Petiz', slug: 'petiz', minAge: 7, maxAge: 9, displayOrder: 1, description: '7 aos 9 anos', gender: 'mixed' },
  { name: 'Traquina', slug: 'traquina', minAge: 9, maxAge: 11, displayOrder: 2, description: '9 aos 11 anos', gender: 'mixed' },
  { name: 'Benjamim', slug: 'benjamim', minAge: 11, maxAge: 13, displayOrder: 3, description: '11 aos 13 anos', gender: 'mixed' },
  { name: 'Infantil', slug: 'infantil', minAge: 13, maxAge: 15, displayOrder: 4, description: '13 aos 15 anos', gender: 'mixed' },
  { name: 'Iniciado', slug: 'iniciado', minAge: 15, maxAge: 17, displayOrder: 5, description: '15 aos 17 anos (Sub-17)', gender: 'mixed' },
  { name: 'Juvenil', slug: 'juvenil', minAge: 17, maxAge: 19, displayOrder: 6, description: '17 aos 19 anos (Sub-19)', gender: 'mixed' },
  { name: 'Júnior', slug: 'junior', minAge: 19, maxAge: 23, displayOrder: 7, description: '19 aos 23 anos (Sub-23)', gender: 'mixed' },
  { name: 'Sénior', slug: 'senior', minAge: 16, maxAge: undefined, displayOrder: 8, description: 'Escalão Principal (+16 anos)', gender: 'mixed' },
  { name: 'Veterano', slug: 'veterano', minAge: 35, maxAge: undefined, displayOrder: 9, description: 'Masters / Veteranos (+35 anos)', gender: 'mixed' },
]

export const CLUB_GENDER_LABELS = {
  male: 'Masculino',
  female: 'Feminino',
  mixed: 'Misto',
} as const

export const CLUB_GENDER_OPTIONS = [
  { value: 'mixed', label: 'Misto (Masculino & Feminino)' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
] as const

export const PLAYER_GENDER_LABELS = {
  male: 'Masculino',
  female: 'Feminino',
} as const

export const PLAYER_GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
] as const

/**
 * Calculates recommended category based on birth date / age.
 * Prioritizes youth/bounded categories before open senior tier.
 */
export function getCategoryByAge(age?: number | null): DefaultCategoryDef | undefined {
  if (age === undefined || age === null || age < 0) return undefined

  // Find exact bounded category
  const bounded = FEDERATION_DEFAULT_CATEGORIES.find((cat) => {
    if (cat.minAge !== undefined && cat.maxAge !== undefined) {
      return age >= cat.minAge && age < cat.maxAge
    }
    return false
  })
  if (bounded) return bounded

  // Fallback for older players (Senior or Veteran)
  if (age >= 35) {
    return FEDERATION_DEFAULT_CATEGORIES.find((c) => c.slug === 'veterano')
  }
  if (age >= 16) {
    return FEDERATION_DEFAULT_CATEGORIES.find((c) => c.slug === 'senior')
  }

  return FEDERATION_DEFAULT_CATEGORIES[0]
}

/**
 * Returns formatted human-readable label for category slug.
 */
export function getCategoryLabel(slug?: string | null): string {
  if (!slug) return 'Sem escalão'
  const match = FEDERATION_DEFAULT_CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase())
  return match ? match.name : slug
}
