import React, { forwardRef, isValidElement, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SportSidebarCardProps {
  title: string;
  icon?: LucideIcon | ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Modular card for sidebar sections.
 */
export const SportSidebarCard = forwardRef<HTMLDivElement, SportSidebarCardProps>(
  ({ title, icon, action, children, className }, ref) => {
    const renderIcon = () => {
      if (!icon) return null;
      if (isValidElement(icon)) return icon;
      const IconComponent = icon as ElementType;
      return <IconComponent className="w-4 h-4" />;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface-container rounded-lg border border-outline-variant/15 flex flex-col',
          className
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-outline-variant/10">
          <div className="flex items-center gap-2 text-on-surface-variant">
            {renderIcon()}
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {title}
            </h3>
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className="p-3">
          {children}
        </div>
      </div>
    );
  }
);
SportSidebarCard.displayName = 'SportSidebarCard';
