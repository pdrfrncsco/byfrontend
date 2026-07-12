import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Trash2, Trophy } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  FormField,
  Input,
  Textarea,
} from '@/components/ui'
import {
  useCreatePlayerAchievement,
  useDeletePlayerAchievement,
  usePlayerAchievements,
} from '../hooks'
import { playerAchievementSchema, type PlayerAchievementFormData } from '../schemas'

const ACHIEVEMENT_TYPE_VALUES = [
  'league_title',
  'cup_title',
  'super_cup',
  'top_scorer',
  'best_player',
  'mvp',
  'golden_boot',
  'other',
] as const

const ACHIEVEMENT_LEVEL_VALUES = ['club', 'national', 'continental', 'international', 'world'] as const

interface PlayerAchievementsSectionProps {
  slug: string
}

export function PlayerAchievementsSection({ slug }: PlayerAchievementsSectionProps) {
  const { t } = useTranslation()
  const { data: achievements = [], isLoading } = usePlayerAchievements(slug)
  const createMutation = useCreatePlayerAchievement(slug)
  const deleteMutation = useDeletePlayerAchievement(slug)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlayerAchievementFormData>({
    resolver: zodResolver(playerAchievementSchema),
    defaultValues: {
      title: '',
      achievement_type: 'league_title',
      level: 'club',
      description: '',
      date_achieved: '',
      season: '',
      competition: '',
      club: '',
      trophy_image: '',
      certificate_url: '',
    },
  })

  const rows = useMemo(() => (Array.isArray(achievements) ? achievements : []), [achievements])

  const onSubmit = (data: PlayerAchievementFormData) => {
    createMutation.mutate(
      {
        title: data.title,
        achievement_type: data.achievement_type,
        level: data.level,
        description: data.description || undefined,
        date_achieved: data.date_achieved || undefined,
        season: data.season || undefined,
        competition: data.competition || undefined,
        club: data.club || undefined,
        trophy_image: data.trophy_image || undefined,
        certificate_url: data.certificate_url || undefined,
      },
      {
        onSuccess: () => reset(),
      },
    )
  }

  return (
    <div className="space-y-lg">
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>{t('players.achievements.section.addTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.achievements.section.title')}
                htmlFor="achievement-title"
                error={errors.title?.message}
                required
              >
                <Input id="achievement-title" {...register('title')} state={errors.title ? 'error' : 'default'} />
              </FormField>
              <FormField
                label={t('players.achievements.section.type')}
                htmlFor="achievement-type"
                error={errors.achievement_type?.message}
                required
              >
                <select
                  id="achievement-type"
                  {...register('achievement_type')}
                  className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {ACHIEVEMENT_TYPE_VALUES.map((type) => (
                    <option key={type} value={type}>
                      {t(`players.achievements.types.${type}`)}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid gap-md md:grid-cols-3">
              <FormField
                label={t('players.achievements.section.level')}
                htmlFor="achievement-level"
                error={errors.level?.message}
                required
              >
                <select
                  id="achievement-level"
                  {...register('level')}
                  className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {ACHIEVEMENT_LEVEL_VALUES.map((level) => (
                    <option key={level} value={level}>
                      {t(`players.achievements.levels.${level}`)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label={t('players.achievements.section.dateAchieved')}
                htmlFor="achievement-date"
                error={errors.date_achieved?.message}
              >
                <Input id="achievement-date" type="date" {...register('date_achieved')} />
              </FormField>
              <FormField
                label={t('players.achievements.section.season')}
                htmlFor="achievement-season"
                error={errors.season?.message}
              >
                <Input id="achievement-season" {...register('season')} placeholder="2024/25" />
              </FormField>
            </div>

            <FormField
              label={t('players.achievements.section.description')}
              htmlFor="achievement-description"
              error={errors.description?.message}
            >
              <Textarea id="achievement-description" rows={3} {...register('description')} />
            </FormField>

            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.achievements.section.trophyImage')}
                htmlFor="achievement-image"
                error={errors.trophy_image?.message}
              >
                <Input id="achievement-image" {...register('trophy_image')} placeholder="https://..." />
              </FormField>
              <FormField
                label={t('players.achievements.section.certificateUrl')}
                htmlFor="achievement-certificate"
                error={errors.certificate_url?.message}
              >
                <Input id="achievement-certificate" {...register('certificate_url')} placeholder="https://..." />
              </FormField>
            </div>

            <Button type="submit" loading={createMutation.isPending}>
              {t('players.achievements.section.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>{t('players.achievements.section.listTitle', { count: rows.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">{t('players.achievements.section.loading')}</p>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title={t('players.achievements.section.emptyTitle')}
              description={t('players.achievements.section.emptyDescription')}
            />
          ) : (
            <div className="space-y-sm">
              {rows.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-md md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-xs">
                    <div className="flex flex-wrap items-center gap-sm">
                      <p className="font-semibold text-on-surface">{achievement.title}</p>
                      <Badge variant="outline">{achievement.achievement_type_label || achievement.achievement_type}</Badge>
                      <Badge variant="secondary">{achievement.level_label || achievement.level}</Badge>
                      {achievement.is_verified && (
                        <Badge variant="primary">{t('players.common.verified')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {achievement.description || t('players.common.noDescription')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error-container/20 hover:text-error"
                    loading={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(achievement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('players.common.delete')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
