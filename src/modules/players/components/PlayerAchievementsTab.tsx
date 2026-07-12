import { useTranslation } from 'react-i18next'
import { Award, ShieldCheck, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerAchievements } from '../hooks'
import type { PlayerAchievement } from '../types'

interface PlayerAchievementsTabProps {
  slug: string
  fallbackAchievements?: PlayerAchievement[]
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale)
}

export function PlayerAchievementsTab({ slug, fallbackAchievements = [] }: PlayerAchievementsTabProps) {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = usePlayerAchievements(slug)
  const achievements = data ?? fallbackAchievements
  const locale = i18n.language || 'pt-AO'

  if (isLoading && achievements.length === 0) {
    return (
      <div className="grid gap-md md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (achievements.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title={t('players.achievements.emptyTitle')}
        description={t('players.achievements.emptyDescription')}
      />
    )
  }

  return (
    <div className="grid gap-md md:grid-cols-2">
      {achievements.map((achievement) => (
        <Card key={achievement.id} variant="flat" padding="none">
          <CardContent className="flex gap-md p-lg">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-container/20 text-primary">
              {achievement.trophy_image ? (
                <img src={achievement.trophy_image} alt={achievement.title} className="h-full w-full object-cover" />
              ) : (
                <Award className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-sm">
              <div className="flex flex-wrap items-center gap-sm">
                <p className="font-semibold text-on-surface">{achievement.title}</p>
                {achievement.is_verified && (
                  <Badge variant="primary">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    {t('players.common.verified')}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-sm">
                <Badge variant="outline">{achievement.achievement_type_label || achievement.achievement_type}</Badge>
                <Badge variant="secondary">{achievement.level_label || achievement.level}</Badge>
              </div>
              {achievement.description && (
                <p className="text-sm text-on-surface-variant">{achievement.description}</p>
              )}
              <div className="flex flex-wrap gap-md text-xs text-on-surface-variant">
                {achievement.competition_name && <span>{achievement.competition_name}</span>}
                {achievement.club_name && <span>{achievement.club_name}</span>}
                {achievement.season && <span>{t('players.achievements.season', { season: achievement.season })}</span>}
                {achievement.year && <span>{achievement.year}</span>}
                {formatDate(achievement.date_achieved, locale) && (
                  <span>{formatDate(achievement.date_achieved, locale)}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
