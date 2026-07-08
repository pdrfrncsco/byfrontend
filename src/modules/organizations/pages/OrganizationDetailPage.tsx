import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  Gamepad2,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  Trophy,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import {
  usePublicOrganizationDetail,
  useOrganizationKpis,
  useOrganizationHistory,
  useSubscribeOrganization,
  useUnsubscribeOrganization,
} from '../hooks'
import {
  OrganizationDetailSkeleton,
  OrganizationErrorState,
  OrganizationHistoryTable,
  KpiCard,
} from '../components'

export function OrganizationDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const {
    data: organization,
    isLoading: isLoadingOrg,
    isError: isErrorOrg,
    refetch: refetchOrg,
  } = usePublicOrganizationDetail(slug)

  const { data: kpis } = useOrganizationKpis(slug)
  const { data: history } = useOrganizationHistory(slug)

  const subscribeMutation = useSubscribeOrganization()
  const unsubscribeMutation = useUnsubscribeOrganization()

  const historyCount = useMemo(() => history?.length ?? 0, [history])

  if (isLoadingOrg) {
    return <OrganizationDetailSkeleton />
  }

  if (isErrorOrg || !organization) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-lg">
        <OrganizationErrorState
          message="Não foi possível obter os detalhes desta organização. Verifique se o endereço está correto."
          onRetry={refetchOrg}
        />
      </div>
    )
  }

  const handleSubscribe = () => {
    if (!slug) return
    subscribeMutation.mutate(slug)
  }

  const handleUnsubscribe = () => {
    if (!slug) return
    unsubscribeMutation.mutate(slug)
  }

  const primaryColor = organization.primary_color || '#1B4D3E'
  const firstLetter = organization.name?.charAt(0) || '?'
  const isSubscribed = organization.is_subscribed ?? false

  return (
    <div className="relative min-h-screen bg-background pb-xl text-on-surface">
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      <div className="relative h-64 w-full overflow-hidden border-b border-outline-variant/30 md:h-80">
        {organization.banner_url ? (
          <img src={organization.banner_url} alt="Banner da Organização" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full opacity-60"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #031427 100%)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute left-gutter top-lg mx-auto w-full max-w-7xl px-gutter">
          <Button variant="outline" size="sm" asChild className="rounded-full bg-surface-lowest/80 backdrop-blur">
            <Link to="/organizations">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar às Organizações</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-20 max-w-7xl space-y-lg px-gutter md:-mt-24">
        <div className="flex flex-col justify-between gap-md border-b border-outline-variant/20 pb-md md:flex-row md:items-end">
          <div className="flex flex-col items-center gap-md text-center md:flex-row md:items-end md:text-left">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-32 w-32 rounded-2xl border-4 border-background bg-surface-container object-cover shadow-lg md:h-36 md:w-36"
              />
            ) : (
              <div
                className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-background font-display-lg text-4xl text-white shadow-lg shadow-black/40 md:h-36 md:w-36 md:text-5xl"
                style={{ backgroundColor: primaryColor }}
              >
                {firstLetter}
              </div>
            )}

            <div className="space-y-sm">
              <div className="flex flex-wrap items-center justify-center gap-sm md:justify-start">
                <h1 className="font-display-lg text-3xl leading-none tracking-tight text-on-surface md:text-4xl">
                  {organization.name}
                </h1>
                {organization.verified && (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" aria-label="Verificada" />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-xs text-sm text-on-surface-variant md:justify-start">
                <MapPin className="h-4 w-4 text-outline" aria-hidden="true" />
                <span>{organization.location || `${organization.city || ''}, ${organization.country}`}</span>
                <span className="text-outline/40">•</span>
                <Badge variant="primary" className="uppercase tracking-wider">
                  {organization.type_label || organization.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-sm">
            {isSubscribed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnsubscribe}
                loading={unsubscribeMutation.isPending}
                className="hover:border-error/20 hover:bg-error/10 hover:text-error"
              >
                <BellOff className="h-4 w-4" />
                <span>Cancelar subscrição</span>
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleSubscribe} loading={subscribeMutation.isPending}>
                <Bell className="h-4 w-4" />
                <span>Subscrever</span>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Resumo Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico & Torneios ({historyCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-12 gap-lg">
              <div className="col-span-12 space-y-lg lg:col-span-8">
                <Card padding="md">
                  <CardHeader className="border-none bg-transparent p-0 pb-md">
                    <CardTitle>
                      <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>Sobre</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                      {organization.description || 'Esta organização ainda não forneceu uma descrição de apresentação.'}
                    </p>
                  </CardContent>
                </Card>

                {kpis ? (
                  <div className="space-y-md">
                    <h3 className="flex items-center gap-xs font-title-md text-lg text-on-surface">
                      <Gamepad2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>Estatísticas Atuais</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-md md:grid-cols-3">
                      <KpiCard label="Torneios Totais" value={kpis.total_tournaments} icon={<Trophy className="h-4 w-4" />} />
                      <KpiCard label="Torneios Ativos" value={kpis.active_tournaments} icon={<Trophy className="h-4 w-4" />} />
                      <KpiCard label="Clubes Registados" value={kpis.total_clubs} icon={<Users className="h-4 w-4" />} />
                      <KpiCard label="Jogos Realizados" value={kpis.total_games} />
                      <KpiCard label="Golos Marcados" value={kpis.total_goals} />
                      <KpiCard label="Subscritores Ativos" value={kpis.active_subscribers} icon={<Users className="h-4 w-4" />} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface-container/20 p-lg text-center text-xs italic text-on-surface-variant">
                    Estatísticas de torneio indisponíveis.
                  </div>
                )}
              </div>

              <div className="col-span-12 space-y-md lg:col-span-4">
                <h3 className="flex items-center gap-xs font-title-md text-lg text-on-surface">
                  <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Contactos</span>
                </h3>

                <Card padding="md" className="space-y-md text-sm">
                  {organization.email && (
                    <div className="flex items-start gap-md">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">Email Oficial</p>
                        <a
                          href={`mailto:${organization.email}`}
                          className="block truncate font-medium text-on-surface transition-colors hover:text-primary hover:underline"
                        >
                          {organization.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {organization.phone && (
                    <div className="flex items-start gap-md">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
                          Contacto Telefónico
                        </p>
                        <a
                          href={`tel:${organization.phone}`}
                          className="block font-medium text-on-surface transition-colors hover:text-primary hover:underline"
                        >
                          {organization.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {organization.website && (
                    <div className="flex items-start gap-md">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">Sítio Web</p>
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate font-medium text-on-surface transition-colors hover:text-primary hover:underline"
                        >
                          {organization.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {!organization.email && !organization.phone && !organization.website && (
                    <p className="py-4 text-center text-xs italic text-on-surface-variant">
                      Nenhum canal de contacto registado.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {history && history.length > 0 ? (
              <OrganizationHistoryTable history={history} />
            ) : (
              <Card padding="lg" className="py-16 text-center">
                <Trophy className="mx-auto mb-md h-12 w-12 text-outline opacity-40" aria-hidden="true" />
                <h4 className="mb-xs font-title-md text-base text-on-surface">Sem Histórico Registado</h4>
                <p className="mx-auto max-w-sm text-sm text-on-surface-variant">
                  Esta organização ainda não possui nenhuma época concluída ou campeões averbados no sistema.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
