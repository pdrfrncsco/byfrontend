import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ExternalLink, Handshake, LayoutDashboard, Search, Settings } from 'lucide-react'
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
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import { useMyRegistrationRequests, usePlayerMe, useSubmitRegistrationRequest } from '../hooks'
import { playerLinkRequestSchema, type PlayerLinkRequestFormData } from '../schemas'
import { playerRoutes } from '../routes'
import type { PlayerRegistrationRequest } from '../types'

function RequestStatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase()
  if (normalized === 'approved') return <Badge variant="success">Aprovado</Badge>
  if (normalized === 'rejected') return <Badge variant="danger">Rejeitado</Badge>
  return <Badge variant="warning">Pendente</Badge>
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

  const { data: player, isLoading: playerLoading } = usePlayerMe()
  const { data: clubsData, isLoading: clubsLoading } = useClubs({ page_size: 100 })
  const { data: requests = [], isLoading: requestsLoading } = useMyRegistrationRequests()
  const submitMutation = useSubmitRegistrationRequest()

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

  const sidebarLinks = [
    { label: t('players.dashboard.sidebar.general'), href: playerRoutes.dashboard, icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: t('players.linkRequest.sidebar'), href: playerRoutes.linkClub, icon: <Handshake className="h-4 w-4" />, active: true },
    { label: t('players.dashboard.sidebar.settings'), href: playerRoutes.dashboardSettings, icon: <Settings className="h-4 w-4" /> },
    {
      label: t('players.dashboard.sidebar.publicProfile'),
      href: player ? playerRoutes.detail(player.slug) : ROUTES.PLAYERS,
      icon: <ExternalLink className="h-4 w-4" />,
    },
  ]

  const filteredClubs = useMemo(() => {
    const clubs = clubsData?.results ?? []
    if (!clubSearch.trim()) return clubs
    const query = clubSearch.toLowerCase()
    return clubs.filter((club) => club.name.toLowerCase().includes(query))
  }, [clubsData, clubSearch])

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

  if (playerLoading) {
    return (
      <DashboardLayout title={t('players.linkRequest.title')} subtitle={t('players.dashboard.settingsLoading')} dashboardType="player" sidebarLinks={sidebarLinks}>
        <Skeleton className="h-64 w-full rounded-[2rem]" />
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
              <h3 className="text-lg font-bold text-on-surface">Já está vinculado a um clube</h3>
              <p className="text-sm text-on-surface-variant max-w-md">
                Atualmente já se encontra vinculado ao clube <strong>{player.current_club.name}</strong>. Não é possível solicitar novos vínculos enquanto estiver associado a um clube.
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

                {clubsLoading ? (
                  <Skeleton className="h-40 w-full rounded-2xl" />
                ) : filteredClubs.length === 0 ? (
                  <EmptyState icon={Handshake} title={t('players.linkRequest.noClubsTitle')} description={t('players.linkRequest.noClubsDescription')} />
                ) : (
                  <div className="grid gap-sm md:grid-cols-2">
                    {filteredClubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => setValue('club_id', club.id, { shouldValidate: true })}
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
                  <Input id="competition-id" {...register('competition_id')} placeholder={t('players.register.competitionPlaceholder')} />
                </FormField>
              </CardContent>
            </Card>

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
            {requestsLoading ? (
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
                    <div>
                      <div className="flex flex-wrap items-center gap-sm">
                        <p className="font-semibold text-on-surface">{request.club_name}</p>
                        <RequestStatusBadge status={request.status} />
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {t('players.register.joinedDate')}: {formatDate(request.joined_date)}
                        {request.shirt_number ? ` • #${request.shirt_number}` : ''}
                      </p>
                      {request.review_notes && (
                        <p className="mt-1 text-xs text-on-surface-variant">{request.review_notes}</p>
                      )}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/clubs/${request.club_slug}`}>{t('players.linkRequest.viewClub')}</Link>
                    </Button>
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
