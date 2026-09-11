import React, { forwardRef, isValidElement, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SportEntityHeaderProps {
  visual?: ReactNode;
  title: string;
  subtitle?: string;
  chips?: { icon?: LucideIcon | ReactNode; label: string }[];
  actions?: ReactNode;
  className?: string;
}

/**
 * Compact entity header inspired by SofaScore (replaces the old gradient DetailHeroCard).
 */
export const SportEntityHeader = forwardRef<HTMLDivElement, SportEntityHeaderProps>(
  ({ visual, title, subtitle, chips, actions, className }, ref) => {
    const renderChipIcon = (icon?: LucideIcon | ReactNode) => {
      if (!icon) return null;
      if (isValidElement(icon)) return icon;
      const IconComp = icon as ElementType;
      return <IconComp className="w-3 h-3" />;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col md:flex-row md:items-center gap-lg bg-surface border-b border-outline-variant/20 px-lg py-md',
          className
        )}
      >
        {visual && <div className="flex-shrink-0">{visual}</div>}
        
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
          
          {chips && chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {chips.map((chip, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant"
                >
                  {renderChipIcon(chip.icon)}
                  {chip.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {actions && <div className="mt-4 md:mt-0 md:ml-auto">{actions}</div>}
      </div>
    );
  }
);
SportEntityHeader.displayName = 'SportEntityHeader';
