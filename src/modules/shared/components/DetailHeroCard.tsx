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
        'overflow-hidden rounded-[2rem] border-outline-variant/20 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)]',
        className,
      )}
    >
      <CardContent
        className={cn(
          'grid gap-xl p-xl backdrop-blur md:grid-cols-[auto_1fr_auto] md:items-center',
          backgroundClassName,
        )}
      >
        {visual ? <div className="flex-shrink-0">{visual}</div> : null}

        <div className="space-y-md">
          {eyebrow ? (
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </div>
          ) : null}

          <div className="space-y-sm">
            <h1 className="font-title-lg text-3xl text-on-surface md:text-4xl">{title}</h1>
            {description ? <p className="max-w-3xl text-base leading-7 text-on-surface-variant">{description}</p> : null}
          </div>

          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
              {chips.map((chip, index) => {
                const ChipIcon = chip.icon
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5"
                  >
                    {ChipIcon ? <ChipIcon className="h-4 w-4" /> : null}
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
