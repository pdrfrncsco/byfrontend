import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Search, Users } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
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
  Skeleton,
} from '@/components/ui'
import { useClubMe } from '@/modules/clubs/hooks/useClubs'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { usePlayers, useRegisterPlayer } from '../hooks'
import { playerRegisterSchema, type PlayerRegisterFormData } from '../schemas'
import type { Player } from '../types'

export function ClubPlayerRegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [playerSearch, setPlayerSearch] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const { data: club, isLoading: clubLoading } = useClubMe()
  const { data: playersData, isLoading: playersLoading } = usePlayers({ page_size: 100, without_club: true })
  const registerMutation = useRegisterPlayer(selectedPlayer?.slug ?? '')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PlayerRegisterFormData>({
    resolver: zodResolver(playerRegisterSchema),
    defaultValues: {
      club_id: '',
      joined_date: new Date().toISOString().split('T')[0],
      shirt_number: '',
      competition_id: '',
    },
  })

  useEffect(() => {
    if (club?.id) {
      setValue('club_id', club.id)
    }
  }, [club?.id, setValue])

  const sidebarLinks = getClubSidebarLinks()

  const filteredPlayers = useMemo(() => {
    const players = playersData?.results ?? []
    if (!playerSearch.trim()) return players
    const query = playerSearch.toLowerCase()
    return players.filter((player) => player.full_name.toLowerCase().includes(query))
  }, [playersData, playerSearch])

  const getErrorMessage = (error: unknown): string => {
    if (!error) return t('players.register.error')
    if (typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { data?: unknown } }).response
      if (response && typeof response.data === 'object' && response.data) {
        const data = response.data as { detail?: string; message?: string }
        return data.detail || data.message || t('players.register.error')
      }
    }
    return t('players.register.error')
  }

  const onSubmit = (data: PlayerRegisterFormData) => {
    if (!selectedPlayer || !club) return

    registerMutation.mutate(
      {
        club_id: club.id,
        joined_date: data.joined_date,
        shirt_number: data.shirt_number || undefined,
        competition_id: data.competition_id || undefined,
      },
      {
        onSuccess: () => navigate(ROUTES.DASHBOARD_CLUB),
      },
    )
  }

  if (clubLoading) {
    return (
      <DashboardLayout title={t('players.register.title')} subtitle={t('players.register.loading')} dashboardType="club" sidebarLinks={sidebarLinks}>
        <Skeleton className="h-64 w-full rounded-[2rem]" />
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout title={t('players.register.title')} subtitle={t('players.register.subtitle')} dashboardType="club" sidebarLinks={sidebarLinks}>
        <EmptyState
          icon={Users}
          title={t('players.register.noClubTitle')}
          description={t('players.register.noClubDescription')}
          action={{ label: t('players.common.back'), onClick: () => navigate(ROUTES.DASHBOARD_CLUB), variant: 'secondary' }}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={t('players.register.titleFull')}
      subtitle={t('players.register.subtitleWithClub', { club: club.name })}
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.DASHBOARD_CLUB)}>
          <ArrowLeft className="h-4 w-4" />
          {t('players.common.back')}
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-5xl gap-xl">
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>{t('players.register.stepSelect')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
              <Input
                variant="search"
                value={playerSearch}
                onChange={(event) => setPlayerSearch(event.target.value)}
                placeholder={t('players.register.searchPlaceholder')}
                className="pl-10"
              />
            </div>

            {playersLoading ? (
              <Skeleton className="h-40 w-full rounded-2xl" />
            ) : filteredPlayers.length === 0 ? (
              <EmptyState icon={Users} title={t('players.register.emptyTitle')} description={t('players.register.emptyDescription')} />
            ) : (
              <div className="grid gap-sm md:grid-cols-2">
                {filteredPlayers.map((player) => {
                  const hasCurrentClub = !!player.current_club
                  const isCurrentClub = player.current_club?.id === club.id
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => !hasCurrentClub && setSelectedPlayer(player)}
                      disabled={hasCurrentClub}
                      className={`rounded-2xl border p-md text-left transition-colors ${
                        selectedPlayer?.id === player.id
                          ? 'border-primary bg-primary-container/15'
                          : hasCurrentClub
                          ? 'border-outline-variant/20 bg-surface-container/50 cursor-not-allowed opacity-60'
                          : 'border-outline-variant/20 bg-surface-container hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-sm">
                        <p className="font-semibold text-on-surface">{player.full_name}</p>
                        <div className="flex gap-xs">
                          <Badge variant="outline">{player.position_label}</Badge>
                          {hasCurrentClub && (
                            <Badge variant={isCurrentClub ? 'success' : 'warning'}>
                              {isCurrentClub ? t('players.register.alreadyInThisClub') : t('players.register.alreadyHasClub')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {player.nationality || t('players.register.nationalityUnknown')}
                        {hasCurrentClub && player.current_club && ` • ${player.current_club.name}`}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>{t('players.register.stepDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-md md:grid-cols-2">
            <FormField label={t('players.register.club')} htmlFor="club-name">
              <Input id="club-name" value={club.name} disabled />
            </FormField>
            <FormField label={t('players.register.joinedDate')} htmlFor="joined-date" error={errors.joined_date?.message} required>
              <Input id="joined-date" type="date" {...register('joined_date')} />
            </FormField>
            <FormField label={t('players.register.shirtNumber')} htmlFor="shirt-number" error={errors.shirt_number?.message}>
              <Input id="shirt-number" type="number" min={1} max={99} {...register('shirt_number')} />
            </FormField>
            <FormField label={t('players.register.competitionId')} htmlFor="competition-id" error={errors.competition_id?.message}>
              <Input id="competition-id" {...register('competition_id')} placeholder={t('players.register.competitionPlaceholder')} />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-sm">
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD_CLUB)}>
            {t('players.common.cancel')}
          </Button>
          <Button type="submit" loading={registerMutation.isPending} disabled={!selectedPlayer}>
            {t('players.register.submit')}
          </Button>
        </div>

        {registerMutation.isError && (
          <p className="text-sm text-error">{getErrorMessage(registerMutation.error)}</p>
        )}
      </form>
    </DashboardLayout>
  )
}
