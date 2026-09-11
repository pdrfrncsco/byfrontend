import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SportSidebarProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Simple sidebar container for sport layouts.
 */
export const SportSidebar = forwardRef<HTMLDivElement, SportSidebarProps>(
  ({ children, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn('flex flex-col gap-md w-full', className)}
      >
        {children}
      </aside>
    );
  }
);
SportSidebar.displayName = 'SportSidebar';
