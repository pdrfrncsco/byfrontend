import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, CalendarDays, CheckCircle2, Handshake, Search } from 'lucide-react'
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
  Input,
  NativeSelect,
  ServerError,
  Skeleton,
} from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { useAcceptRegistrationRequest, useClubCompetitions, useMyRegistrationRequests, usePlayerMe, useSubmitRegistrationRequest } from '../hooks'
import { playerLinkRequestSchema, type PlayerLinkRequestFormData } from '../schemas'
import { playerRoutes } from '../routes'
import { getPlayerSidebarLinks } from '../constants/navigation'
import type { PlayerRegistrationRequest } from '../types'

function RequestStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const normalized = status?.toLowerCase()
  if (normalized === 'approved') return <Badge variant="success">{t('players.linkRequest.status.approved')}</Badge>
  if (normalized === 'invited') return <Badge variant="secondary">{t('players.linkRequest.status.invited')}</Badge>
  if (normalized === 'rejected') return <Badge variant="danger">{t('players.linkRequest.status.rejected')}</Badge>
  return <Badge variant="warning">{t('players.linkRequest.status.pending')}</Badge>
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

export function PlayerClubLinkRequestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [clubSearch, setClubSearch] = useState('')

  const { data: player, isLoading: playerLoading, isError: playerError, refetch: refetchPlayer } = usePlayerMe()
  const { data: clubsData, isLoading: clubsLoading, isError: clubsError, refetch: refetchClubs } = useClubs({ page_size: 100 })
  const { data: requests = [], isLoading: requestsLoading, isError: requestsError, refetch: refetchRequests } = useMyRegistrationRequests()
  const submitMutation = useSubmitRegistrationRequest()
  const acceptMutation = useAcceptRegistrationRequest()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlayerLinkRequestFormData>({
    resolver: zodResolver(playerLinkRequestSchema),
    defaultValues: {
      club_id: '',
      joined_date: new Date().toISOString().split('T')[0],
      shirt_number: '',
      competition_id: '',
    },
  })

  const selectedClubId = watch('club_id')

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  const filteredClubs = useMemo(() => {
    const clubs = clubsData?.results ?? []
    if (!clubSearch.trim()) return clubs
    const query = clubSearch.toLowerCase()
    return clubs.filter((club) => club.name.toLowerCase().includes(query))
  }, [clubsData, clubSearch])
  const selectedClub = filteredClubs.find((club) => club.id === selectedClubId)

  const onSubmit = (data: PlayerLinkRequestFormData) => {
    submitMutation.mutate(
      {
        club_id: data.club_id,
        joined_date: data.joined_date,
        shirt_number: data.shirt_number ? Number(data.shirt_number) : undefined,
        competition_id: data.competition_id || undefined,
      },
      {
        onSuccess: () => reset({ ...data, club_id: '', shirt_number: '', competition_id: '' }),
      },
    )
  }

  const { data: competitions = [], isLoading: competitionsLoading } = useClubCompetitions(selectedClubId)
  const selectedCompetition = competitions.find((competition) => competition.id === watch('competition_id'))

  if (playerLoading) {
    return (
      <DashboardLayout title={t('players.linkRequest.title')} subtitle={t('players.dashboard.settingsLoading')} dashboardType="player" sidebarLinks={sidebarLinks}>
        <Skeleton className="h-64 w-full rounded-[2rem]" />
      </DashboardLayout>
    )
  }

  if (playerError) {
    return (
      <DashboardLayout title={t('players.linkRequest.title')} subtitle={t('players.linkRequest.subtitle')} dashboardType="player" sidebarLinks={sidebarLinks}>
        <ServerError title={t('players.linkRequest.loadErrorTitle')} message={t('players.linkRequest.loadErrorDescription')} onRetry={() => refetchPlayer()} />
      </DashboardLayout>
    )
  }

  if (!player) {
    return (
      <DashboardLayout title={t('players.linkRequest.title')} subtitle={t('players.dashboard.subtitle')} dashboardType="player" sidebarLinks={sidebarLinks}>
        <EmptyState
          icon={Handshake}
          title={t('players.dashboard.notFoundTitle')}
          description={t('players.dashboard.notFoundDescription')}
          action={{ label: t('players.dashboard.explorePlayers'), onClick: () => navigate(ROUTES.PLAYERS), variant: 'secondary' }}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={t('players.linkRequest.title')}
      subtitle={t('players.linkRequest.subtitle')}
      dashboardType="player"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(playerRoutes.dashboard)}>
          <ArrowLeft className="h-4 w-4" />
          {t('players.common.back')}
        </Button>
      }
    >
      <div className="mx-auto grid max-w-5xl gap-xl">
        {player.current_club ? (
          <Card variant="flat" padding="lg" className="border-warning/35 bg-warning-container/5">
            <div className="flex flex-col items-center justify-center text-center p-lg space-y-md">
              <Handshake className="h-12 w-12 text-warning" />
              <h3 className="text-lg font-bold text-on-surface">{t('players.linkRequest.alreadyLinkedTitle')}</h3>
              <p className="text-sm text-on-surface-variant max-w-md">
                {t('players.linkRequest.alreadyLinkedDescription', { club: player.current_club.name })}
              </p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-xl">
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle>{t('players.linkRequest.selectClub')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <Input
                    variant="search"
                    value={clubSearch}
                    onChange={(event) => setClubSearch(event.target.value)}
                    placeholder={t('players.linkRequest.searchClubPlaceholder')}
                    className="pl-10"
                  />
                </div>

                {clubsError ? (
                  <ServerError title={t('players.linkRequest.clubsErrorTitle')} message={t('players.linkRequest.loadErrorDescription')} onRetry={() => refetchClubs()} />
                ) : clubsLoading ? (
                  <Skeleton className="h-40 w-full rounded-2xl" />
                ) : filteredClubs.length === 0 ? (
                  <EmptyState icon={Handshake} title={t('players.linkRequest.noClubsTitle')} description={t('players.linkRequest.noClubsDescription')} />
                ) : (
                  <div className="grid gap-sm md:grid-cols-2">
                    {filteredClubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => {
                          setValue('club_id', club.id, { shouldValidate: true })
                          setValue('competition_id', '')
                        }}
                        aria-pressed={selectedClubId === club.id}
                        className={`rounded-2xl border p-md text-left transition-colors ${
                          selectedClubId === club.id
                            ? 'border-primary bg-primary-container/15'
                            : 'border-outline-variant/20 bg-surface-container hover:border-primary/40'
                        }`}
                      >
                        <p className="font-semibold text-on-surface">{club.name}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{club.city || club.country || '—'}</p>
                      </button>
                    ))}
                  </div>
                )}
                {errors.club_id && <p className="text-sm text-error">{errors.club_id.message}</p>}
              </CardContent>
            </Card>

            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle>{t('players.linkRequest.detailsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-md md:grid-cols-2">
                <FormField label={t('players.register.joinedDate')} htmlFor="joined-date" error={errors.joined_date?.message} required>
                  <Input id="joined-date" type="date" {...register('joined_date')} />
                </FormField>
                <FormField label={t('players.register.shirtNumber')} htmlFor="shirt-number" error={errors.shirt_number?.message}>
                  <Input id="shirt-number" type="number" min={1} max={99} {...register('shirt_number')} />
                </FormField>
                <FormField label={t('players.register.competitionId')} htmlFor="competition-id" error={errors.competition_id?.message}>
                  <NativeSelect id="competition-id" {...register('competition_id')} disabled={!selectedClubId || competitionsLoading}>
                    <option value="">{competitionsLoading ? t('players.linkRequest.loading') : t('players.linkRequest.noCompetition')}</option>
                    {competitions.map((competition) => (
                      <option key={competition.id} value={competition.id}>
                        {competition.name} ({competition.season})
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>
              </CardContent>
            </Card>

            {selectedClub && (
              <Card variant="flat" padding="lg" className="border-primary/25 bg-primary-container/10">
                <div className="flex items-start gap-md">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0 space-y-xs">
                    <h3 className="font-semibold text-on-surface">{t('players.linkRequest.summaryTitle')}</h3>
                    <p className="text-sm text-on-surface-variant">{t('players.linkRequest.summaryDescription')}</p>
                    <dl className="grid gap-sm pt-sm text-sm sm:grid-cols-3">
                      <div><dt className="text-xs text-on-surface-variant">{t('players.linkRequest.summaryClub')}</dt><dd className="font-semibold text-on-surface">{selectedClub.name}</dd></div>
                      <div><dt className="text-xs text-on-surface-variant">{t('players.linkRequest.summaryCompetition')}</dt><dd className="font-semibold text-on-surface">{selectedCompetition?.name ?? t('players.linkRequest.noCompetition')}</dd></div>
                      <div><dt className="text-xs text-on-surface-variant">{t('players.register.joinedDate')}</dt><dd className="flex items-center gap-xs font-semibold text-on-surface"><CalendarDays className="h-4 w-4" aria-hidden="true" />{formatDate(watch('joined_date'))}</dd></div>
                    </dl>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={submitMutation.isPending} disabled={!selectedClubId}>
                {t('players.linkRequest.submit')}
              </Button>
            </div>
          </form>
        )}

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>{t('players.linkRequest.myRequestsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {requestsError ? (
              <ServerError title={t('players.linkRequest.requestsErrorTitle')} message={t('players.linkRequest.loadErrorDescription')} onRetry={() => refetchRequests()} />
            ) : requestsLoading ? (
              <Skeleton className="h-32 w-full rounded-2xl" />
            ) : requests.length === 0 ? (
              <EmptyState icon={Handshake} title={t('players.linkRequest.noRequestsTitle')} description={t('players.linkRequest.noRequestsDescription')} />
            ) : (
              <div className="space-y-sm">
                {requests.map((request: PlayerRegistrationRequest) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container p-md md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-sm">
                        <p className="font-semibold text-on-surface">{request.club_name}</p>
                        <RequestStatusBadge status={request.status} t={t} />
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {t('players.register.joinedDate')}: {formatDate(request.joined_date)} • {t('players.linkRequest.lastUpdated')}: {formatDate(request.updated_at || request.created_at)}
                        {request.shirt_number ? ` • #${request.shirt_number}` : ''}
                      </p>
                      {request.review_notes && (
                        <p className="mt-1 text-xs text-on-surface-variant">{request.review_notes}</p>
                      )}
                    </div>
                    <div className="flex gap-xs mt-sm md:mt-0">
                      {['approved', 'invited'].includes(request.status?.toLowerCase()) && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => acceptMutation.mutate(request.id)}
                          loading={acceptMutation.isPending}
                        >
                          {t('players.linkRequest.accept')}
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/clubs/${request.club_slug}`}>{t('players.linkRequest.viewClub')}</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
