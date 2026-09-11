import React, { forwardRef, isValidElement, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SportStatRowProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon | ReactNode;
  accentColor?: string;
  className?: string;
}

/**
 * Compact label-value stat line.
 */
export const SportStatRow = forwardRef<HTMLDivElement, SportStatRowProps>(
  ({ label, value, icon, accentColor, className }, ref) => {
    const renderIcon = () => {
      if (!icon) return null;
      if (isValidElement(icon)) return icon;
      const IconComponent = icon as ElementType;
      return <IconComponent className="w-3.5 h-3.5" />;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between py-1.5 border-b border-outline-variant/8 last:border-0',
          className
        )}
      >
        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
          {renderIcon()}
          <span>{label}</span>
        </div>
        <div
          className={cn('text-sm font-semibold text-right', accentColor ? accentColor : 'text-on-surface')}
        >
          {value}
        </div>
      </div>
    );
  }
);
SportStatRow.displayName = 'SportStatRow';
