import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ExternalLink, Handshake, LayoutDashboard, Save, Settings } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, Card, CardContent, FormField, Input, Textarea, Badge } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ROUTES } from '@/constants/routes'
import {
  PlayerAchievementsSection,
  PlayerAvatarUpload,
  PlayerDocumentsSection,
  PlayerFormSkeleton,
  PlayerVideosSection,
} from '../components'
import { usePlayerMe, useUpdatePlayerMe } from '../hooks'
import { playerUpdateSchema, type PlayerUpdateFormData } from '../schemas'
import { ALL_POSITIONS, POSITION_COLOR, STATUS_COLOR } from '../constants'
import { playerRoutes } from '../routes'

export function PlayerDashboardSettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()
  const updateMutation = useUpdatePlayerMe()

  const sidebarLinks = [
    { label: t('players.dashboard.sidebar.general'), href: playerRoutes.dashboard, icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: t('players.linkRequest.sidebar'), href: playerRoutes.linkClub, icon: <Handshake className="h-4 w-4" /> },
    { label: t('players.dashboard.sidebar.settings'), href: playerRoutes.dashboardSettings, icon: <Settings className="h-4 w-4" />, active: true },
    {
      label: t('players.dashboard.sidebar.publicProfile'),
      href: player ? playerRoutes.detail(player.slug) : ROUTES.PLAYERS,
      icon: <ExternalLink className="h-4 w-4" />,
    },
  ]

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PlayerUpdateFormData>({
    resolver: zodResolver(playerUpdateSchema),
    mode: 'onBlur',
  })

  const avatar = watch('avatar')

  useEffect(() => {
    if (player) {
      reset({
        first_name: player.first_name || '',
        last_name: player.last_name || '',
        date_of_birth: player.date_of_birth?.split('T')[0] || '',
        nationality: player.nationality || '',
        primary_position: player.primary_position || undefined,
        email: player.email || '',
        phone: player.phone || '',
        height_cm: player.height_cm || undefined,
        weight_kg: player.weight_kg || undefined,
        foot: player.foot || undefined,
        bio: player.bio || '',
        avatar: player.avatar || '',
        is_public: player.is_public,
        status: player.status || undefined,
      })
    }
  }, [player, reset])

  const onSubmit = (data: PlayerUpdateFormData) => {
    updateMutation.mutate({
      ...data,
      date_of_birth: data.date_of_birth || undefined,
      nationality: data.nationality || undefined,
      primary_position: data.primary_position || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      height_cm: data.height_cm || undefined,
      weight_kg: data.weight_kg || undefined,
      foot: data.foot || undefined,
      bio: data.bio || undefined,
      avatar: data.avatar || undefined,
      is_public: data.is_public ?? false,
      status: data.status || undefined,
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout
        title={t('players.dashboard.settingsTitle')}
        subtitle={t('players.dashboard.settingsLoading')}
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <PlayerFormSkeleton />
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title={t('players.dashboard.settingsTitle')}
        subtitle={t('players.dashboard.subtitle')}
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          title={t('players.dashboard.settingsNotFoundTitle')}
          description={t('players.dashboard.settingsNotFoundDescription')}
          action={{
            label: t('players.common.back'),
            onClick: () => navigate(playerRoutes.dashboard),
            variant: 'secondary',
          }}
        />
      </DashboardLayout>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <DashboardLayout
      title={t('players.dashboard.settingsTitleWithName', { name: player.full_name })}
      subtitle={t('players.dashboard.settingsSubtitle')}
      dashboardType="player"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(playerRoutes.dashboard)}>
          <ArrowLeft className="h-4 w-4" />
          {t('players.common.back')}
        </Button>
      }
    >
      <Tabs defaultValue="profile">
        <TabsList className="mb-lg flex flex-wrap gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container/70 p-sm">
          <TabsTrigger value="profile">{t('players.settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="documents">{t('players.settings.tabs.documents')}</TabsTrigger>
          <TabsTrigger value="videos">{t('players.settings.tabs.videos')}</TabsTrigger>
          <TabsTrigger value="achievements">{t('players.settings.tabs.achievements')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card variant="flat" padding="none">
            <CardContent className="space-y-lg p-lg">
              <div className="flex flex-wrap items-start gap-lg">
                <PlayerAvatarUpload
                  slug={player.slug}
                  avatarUrl={avatar || player.avatar}
                  initials={initials}
                  accentColor={positionColor}
                  onUploaded={(url) => setValue('avatar', url, { shouldDirty: true })}
                />
                <div className="space-y-sm">
                  <div className="flex flex-wrap items-center gap-sm">
                    <h2 className="text-xl font-bold text-on-surface">{player.full_name}</h2>
                    <Badge
                      variant="outline"
                      style={{ borderColor: statusColor, color: statusColor, background: `${statusColor}15` }}
                    >
                      {player.status_label}
                    </Badge>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={playerRoutes.detail(player.slug)}>{t('players.dashboard.publicProfile')}</Link>
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
                <div className="grid gap-md md:grid-cols-2">
                  <FormField label={t('players.form.firstName')} htmlFor="first_name" error={errors.first_name?.message} required>
                    <Input id="first_name" {...register('first_name')} />
                  </FormField>
                  <FormField label={t('players.form.lastName')} htmlFor="last_name" error={errors.last_name?.message} required>
                    <Input id="last_name" {...register('last_name')} />
                  </FormField>
                </div>

                <div className="grid gap-md md:grid-cols-3">
                  <FormField label={t('players.form.dateOfBirth')} htmlFor="date_of_birth" error={errors.date_of_birth?.message}>
                    <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
                  </FormField>
                  <FormField label={t('players.form.nationality')} htmlFor="nationality" error={errors.nationality?.message}>
                    <Input id="nationality" {...register('nationality')} />
                  </FormField>
                  <FormField label={t('players.form.primaryPosition')} htmlFor="primary_position" error={errors.primary_position?.message}>
                    <select
                      id="primary_position"
                      {...register('primary_position')}
                      className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="">{t('players.form.select')}</option>
                      {ALL_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.fullLabel}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label={t('players.form.bio')} htmlFor="bio" error={errors.bio?.message}>
                  <Textarea id="bio" rows={4} {...register('bio')} />
                </FormField>

                <FormField label={t('players.form.publicProfile')} htmlFor="is_public">
                  <div className="flex items-center gap-sm">
                    <input
                      id="is_public"
                      type="checkbox"
                      {...register('is_public')}
                      className="h-4 w-4 rounded border-outline-variant text-primary"
                    />
                    <span className="text-sm text-on-surface-variant">
                      {t('players.form.publicProfileHint')}
                    </span>
                  </div>
                </FormField>

                <div className="flex justify-end">
                  <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? t('players.form.saving') : t('players.form.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <PlayerDocumentsSection slug={player.slug} />
        </TabsContent>
        <TabsContent value="videos">
          <PlayerVideosSection slug={player.slug} />
        </TabsContent>
        <TabsContent value="achievements">
          <PlayerAchievementsSection slug={player.slug} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
