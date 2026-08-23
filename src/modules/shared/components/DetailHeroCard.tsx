import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DetailHeroChip {
  icon?: LucideIcon
  label: ReactNode
}

interface DetailHeroCardProps {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  visual?: ReactNode
  chips?: DetailHeroChip[]
  actions?: ReactNode
  backgroundClassName?: string
  className?: string
}

export function DetailHeroCard({
  title,
  description,
  eyebrow,
  visual,
  chips = [],
  actions,
  backgroundClassName,
  className,
}: DetailHeroCardProps) {
  return (
    <Card
      variant="flat"
      padding="none"
      className={cn(
        'overflow-hidden rounded-[2rem] border border-outline-variant/80 bg-surface-container-low shadow-[0_22px_48px_-32px_rgba(15,17,23,0.28)]',
        className,
      )}
    >
      <CardContent
        className={cn(
          'grid gap-lg p-lg backdrop-blur md:grid-cols-[auto_1fr_auto] md:items-center md:p-xl',
          backgroundClassName,
        )}
      >
        {visual ? <div className="flex-shrink-0">{visual}</div> : null}

        <div className="space-y-md">
          {eyebrow ? (
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/25 bg-primary-container/20 px-md py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </div>
          ) : null}

          <div className="space-y-sm">
            <h1 className="font-display-lg text-[2.25rem] leading-[0.96] tracking-[-0.05em] text-on-surface md:text-[3.1rem]">{title}</h1>
            {description ? <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-[1.05rem]">{description}</p> : null}
          </div>

          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
              {chips.map((chip, index) => {
                const ChipIcon = chip.icon
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-high px-md py-1.5 text-sm font-medium shadow-[0_1px_0_rgba(15,23,42,0.02)]"
                  >
                    {ChipIcon ? <ChipIcon className="h-4 w-4 text-primary" /> : null}
                    {chip.label}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap justify-start gap-sm md:justify-end">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}
