/**
 * BOLAYETU — Player Category Types
 */

export type CategoryScope = 'federation' | 'club'
export type CategoryGender = 'male' | 'female' | 'mixed'

export interface PlayerCategory {
  id: string
  tenant?: string
  tenant_name?: string
  club?: string | null
  club_name?: string | null
  scope: CategoryScope
  scope_label?: string
  name: string
  slug: string
  min_age?: number | null
  max_age?: number | null
  gender: CategoryGender
  gender_label?: string
  is_custom: boolean
  is_active: boolean
  display_order: number
  players_count?: number
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryDto {
  name: string
  min_age?: number | null
  max_age?: number | null
  gender?: CategoryGender
  is_active?: boolean
  display_order?: number
}

export interface UpdateCategoryDto {
  name?: string
  min_age?: number | null
  max_age?: number | null
  gender?: CategoryGender
  is_active?: boolean
  display_order?: number
}
