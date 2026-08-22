import { type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type NavIcon = LucideIcon | ReactNode

export interface NavItem {
  /** Optional while legacy dashboard definitions are progressively migrated. */
  key?: string
  label: string
  href: string
  icon: NavIcon
  badge?: number | string
  roles?: string[]
  children?: NavItem[]
  group?: string
  hidden?: boolean
  active?: boolean
  disabled?: boolean
  count?: number
}

export interface NavContext {
  type: 'organization' | 'club' | 'competition' | 'player' | 'admin'
  entityId: string
  entityName: string
  entityLogo?: string
  entityAvatar?: string
  accentColor?: string
  subLabel?: string
}
