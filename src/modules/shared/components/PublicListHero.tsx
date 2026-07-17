import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PublicListHeroStat {
  label: ReactNode
}

interface PublicListHeroMetric {
  label: ReactNode
  value: ReactNode
}

interface PublicListHeroProps {
  badge: ReactNode
  title: ReactNode
  description: ReactNode
  stats?: PublicListHeroStat[]
  insightIcon?: LucideIcon
  insightTitle: ReactNode
  insightDescription: ReactNode
  metrics?: PublicListHeroMetric[]
  backgroundClassName?: string
}

export function PublicListHero({
  badge,
  title,
  description,
  stats = [],
  insightIcon: InsightIcon = Sparkles,
  insightTitle,
  insightDescription,
  metrics = [],
  backgroundClassName,
}: PublicListHeroProps) {
  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.20),transparent_40%),radial-gradient(circle_at_top_right,rgba(17,94,89,0.16),transparent_38%),linear-gradient(180deg,rgba(7,16,29,0.94),rgba(7,16,29,0.08))]',
          backgroundClassName,
        )}
      />
      <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/70 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur md:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-md">
          <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {badge}
          </div>
          <div className="space-y-sm">
            <h1 className="font-title-lg text-4xl text-on-surface md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-base leading-7 text-on-surface-variant">{description}</p>
          </div>
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
              {stats.map((stat, index) => (
                <span
                  key={index}
                  className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5"
                >
                  {stat.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <Card variant="flat" padding="none" className="border-outline-variant/20">
          <CardContent className="grid h-full gap-md p-lg">
            <div className="flex items-start gap-sm">
              <div className="rounded-2xl bg-primary-container/20 p-sm text-primary">
                <InsightIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-on-surface">{insightTitle}</p>
                <p className="text-sm text-on-surface-variant">{insightDescription}</p>
              </div>
            </div>

            {metrics.length > 0 && (
              <div className="grid gap-sm sm:grid-cols-2">
                {metrics.map((metric, index) => (
                  <div key={index} className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                    <p className="text-xs uppercase tracking-wide text-on-surface-variant">{metric.label}</p>
                    <p className="mt-1 text-2xl font-bold text-on-surface">{metric.value}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
