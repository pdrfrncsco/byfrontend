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
import { organizationRoutes } from '../routes'
import { DetailHeroCard } from '@/modules/shared/components/DetailHeroCard'

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
  const verifiedLabel = organization.verified || organization.is_verified ? 'Verificada' : 'Pública'
  const statusLabelByKey = {
    active: 'Ativa',
    suspended: 'Suspensa',
    closed: 'Encerrada',
    pending: 'Pendente',
  } as const
  const statusLabel = organization.status_label || (organization.status ? statusLabelByKey[organization.status] : undefined) || 'Ativa'
  const locationLabel = organization.location || [organization.city, organization.country].filter(Boolean).join(', ')

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      {/* Background Gradient Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
        <DetailHeroCard
          eyebrow="Organização pública"
          title={organization.name}
          description={organization.description || 'Perfil público da organização com estatísticas, contactos e histórico.'}
          visual={
            organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-32 w-32 rounded-3xl border border-outline-variant/20 object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-32 w-32 items-center justify-center rounded-3xl border border-outline-variant/20 font-display-lg text-4xl text-white shadow-lg shadow-black/30"
                style={{ backgroundColor: primaryColor }}
              >
                {firstLetter}
              </div>
            )
          }
          chips={[
            { icon: MapPin, label: locationLabel },
            { label: organization.type_label || organization.type },
            { icon: CheckCircle2, label: verifiedLabel },
            { label: statusLabel },
          ]}
          backgroundClassName="bg-[radial-gradient(circle_at_top_left,rgba(148,211,193,0.14),transparent_38%),radial-gradient(circle_at_top_right,rgba(66,153,225,0.12),transparent_36%),linear-gradient(180deg,rgba(7,16,29,0.92),rgba(7,16,29,0.76))]"
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={organizationRoutes.list}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar às Organizações</span>
                </Link>
              </Button>
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
            </>
          }
        />

        <Tabs defaultValue="overview" className="space-y-lg">
          <TabsList className="h-auto rounded-full p-sm bg-surface-container/50 border border-outline-variant/30">
            <TabsTrigger 
              value="overview" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              Resumo Geral
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              Histórico & Torneios ({historyCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="overview"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="grid grid-cols-12 gap-lg">
              <div className="col-span-12 space-y-lg lg:col-span-8">
                <Card padding="md" className="shadow-lg shadow-black/10">
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

                <Card padding="md" className="space-y-md text-sm shadow-lg shadow-black/10">
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

          <TabsContent 
            value="history"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {history && history.length > 0 ? (
              <OrganizationHistoryTable history={history} />
            ) : (
              <Card padding="lg" className="py-16 text-center shadow-lg shadow-black/10">
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
