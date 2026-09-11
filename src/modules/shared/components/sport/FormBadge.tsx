import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type MatchResult = 'W' | 'D' | 'L';

export interface FormBadgeProps {
  results: MatchResult[];
  className?: string;
}

const resultConfig: Record<MatchResult, { label: string; colorClass: string }> = {
  W: { label: 'V', colorClass: 'bg-emerald-500' },
  D: { label: 'E', colorClass: 'bg-gray-400' },
  L: { label: 'D', colorClass: 'bg-red-500' },
};

/**
 * Recent form badge showing W/D/L results (mapped to V/E/D in Portuguese).
 */
export const FormBadge = forwardRef<HTMLDivElement, FormBadgeProps>(
  ({ results, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)}>
        {results.map((result, index) => {
          const config = resultConfig[result];
          return (
            <span
              key={index}
              className={cn(
                'flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold',
                config.colorClass
              )}
              title={config.label}
            >
              {config.label}
            </span>
          );
        })}
      </div>
    );
  }
);
FormBadge.displayName = 'FormBadge';
