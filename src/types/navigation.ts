import { type LucideIcon } from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  badge?: number | string
  roles?: string[]
  children?: NavItem[]
  group?: string
  hidden?: boolean
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
