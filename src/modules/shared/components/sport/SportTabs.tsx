import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/** Sport-themed tabs root — wraps Radix Tabs.Root directly. */
export const SportTabs = TabsPrimitive.Root

/** Horizontal scrollable tab list with underline border. */
export const SportTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex gap-0 border-b border-outline-variant/20 overflow-x-auto scrollbar-hide',
      className
    )}
    {...props}
  />
))
SportTabsList.displayName = 'SportTabsList'

export interface SportTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  icon?: LucideIcon | React.ReactNode
}

/** Tab trigger with animated underline indicator (SofaScore style). */
export const SportTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  SportTabsTriggerProps
>(({ className, children, icon, ...props }, ref) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'group relative px-4 py-2.5 text-sm font-medium text-on-surface-variant',
        'hover:text-on-surface transition-colors whitespace-nowrap',
        'data-[state=active]:text-primary data-[state=active]:font-semibold',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {renderIcon()}
        {children}
      </div>
      {/* Underline indicator — scales in when tab is active via Radix data attribute */}
      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary scale-x-0 transition-transform duration-200 group-data-[state=active]:scale-x-100" />
    </TabsPrimitive.Trigger>
  )
})
SportTabsTrigger.displayName = 'SportTabsTrigger'

/** Tab content panel with fade-in animation. */
export const SportTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-md focus-visible:outline-none animate-in fade-in duration-200',
      className
    )}
    {...props}
  />
))
SportTabsContent.displayName = 'SportTabsContent'
