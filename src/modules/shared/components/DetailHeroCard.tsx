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
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-card to-muted/50 p-0 shadow-lg',
        className
      )}
    >
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <CardContent
        className={cn(
          'relative z-10 grid gap-md p-lg md:grid-cols-[auto_1fr_auto] md:items-center md:p-xl',
          backgroundClassName
        )}
      >
        {visual ? <div className="flex-shrink-0">{visual}</div> : null}

        <div className="space-y-sm">
          {eyebrow ? (
            <div className="inline-flex items-center gap-xs rounded-full border border-primary/30 bg-primary/10 px-md py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              {eyebrow}
            </div>
          ) : null}

          <div className="space-y-xs">
            <h1 className="font-display-lg text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description ? <p className="max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p> : null}
          </div>

          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-xs pt-xs text-xs">
              {chips.map((chip, index) => {
                const ChipIcon = chip.icon
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-md py-1 font-semibold text-foreground"
                  >
                    {ChipIcon ? <ChipIcon className="h-3.5 w-3.5 text-primary" /> : null}
                    {chip.label}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap justify-start gap-xs md:justify-end">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}
