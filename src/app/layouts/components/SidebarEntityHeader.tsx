import * as React from 'react'
import { cn } from '@/lib/utils'
import { type NavContext } from '@/types/navigation'
import { EntitySwitcher } from './EntitySwitcher'

interface SidebarEntityHeaderProps {
  context: NavContext
}

export function SidebarEntityHeader({ context }: SidebarEntityHeaderProps) {
  const logoSrc = context.entityLogo ?? context.entityAvatar
  const fallback = context.entityName?.slice(0, 2).toUpperCase() || 'BY'

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b mb-lg" style={{ borderColor: 'var(--dashboard-border)' }}>
      <div className="relative h-9 w-9 shrink-0">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={context.entityName}
            className={cn(
              "h-full w-full object-cover",
              context.type === 'player' ? "rounded-full" : "rounded-md"
            )}
          />
        ) : (
          <div className={cn(
            "h-full w-full flex items-center justify-center",
            "bg-[#0f6e56] text-white text-sm font-semibold",
            context.type === 'player' ? "rounded-full" : "rounded-md"
          )}>
            {fallback}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight text-on-surface">
          {context.entityName}
        </p>
        <p className="truncate text-xs text-on-surface-variant font-medium mt-0.5">
          {context.subLabel || context.type}
        </p>
      </div>

      <EntitySwitcher context={context} />
    </div>
  )
}
