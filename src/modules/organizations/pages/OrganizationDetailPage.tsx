import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  KpiCard
} from '../components'
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  Users,
  Trophy,
  Info,
  Gamepad2,
  Bell,
  BellOff
} from 'lucide-react'

export function OrganizationDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null) // local state helper

  const {
    data: organization,
    isLoading: isLoadingOrg,
    isError: isErrorOrg,
    refetch: refetchOrg
  } = usePublicOrganizationDetail(slug)

  const { data: kpis } = useOrganizationKpis(slug)
  const { data: history } = useOrganizationHistory(slug)

  const subscribeMutation = useSubscribeOrganization()
  const unsubscribeMutation = useUnsubscribeOrganization()

  if (isLoadingOrg) {
    return <OrganizationDetailSkeleton />
  }

  if (isErrorOrg || !organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-lg">
        <OrganizationErrorState
          message="Não foi possível obter os detalhes desta organização. Verifique se o endereço está correto."
          onRetry={refetchOrg}
        />
      </div>
    )
  }

  const handleSubscribe = () => {
    if (slug) {
      subscribeMutation.mutate(slug, {
        onSuccess: () => {
          setIsSubscribed(true)
        }
      })
    }
  }

  const handleUnsubscribe = () => {
    if (slug) {
      unsubscribeMutation.mutate(slug, {
        onSuccess: () => {
          setIsSubscribed(false)
        }
      })
    }
  }

  const primaryColor = organization.primary_color || '#1B4D3E'
  const firstLetter = organization.name?.charAt(0) || '?'

  return (
    <div className="min-h-screen bg-background text-on-surface relative pb-xl">
      {/* Background glow elements */}
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      {/* Header Cover Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-outline-variant/30">
        {organization.banner_url ? (
          <img
            src={organization.banner_url}
            alt="Banner da Organização"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full opacity-60"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #031427 100%)`,
            }}
          />
        )}
        {/* Cover overlay grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Back Link */}
        <div className="absolute top-lg left-gutter max-w-7xl mx-auto w-full px-gutter">
          <Link
            to="/organizations"
            className="inline-flex items-center gap-xs px-md py-1.5 rounded-full bg-surface-lowest/80 backdrop-blur text-xs font-semibold text-[#d3e4fe] border border-outline-variant/30 hover:border-primary transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar às Organizações</span>
          </Link>
        </div>
      </div>

      {/* Profile Overlapping Info */}
      <div className="max-w-7xl mx-auto px-gutter -mt-20 md:-mt-24 relative z-10 space-y-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md pb-md border-b border-outline-variant/20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-md text-center md:text-left">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-background shadow-lg bg-surface-container"
              />
            ) : (
              <div
                className="w-32 h-32 md:w-36 md:h-36 rounded-2xl flex items-center justify-center text-white font-display-lg text-4xl md:text-5xl border-4 border-background shadow-lg shadow-black/40"
                style={{ backgroundColor: primaryColor }}
              >
                {firstLetter}
              </div>
            )}

            <div className="space-y-sm">
              <div className="flex items-center gap-sm justify-center md:justify-start flex-wrap">
                <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface tracking-tight leading-none">
                  {organization.name}
                </h1>
                {organization.verified && (
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" aria-label="Verificada" />
                )}
              </div>

              <div className="flex items-center gap-xs text-body-md text-on-surface-variant text-sm justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-outline" />
                <span>{organization.location || `${organization.city || ''}, ${organization.country}`}</span>
                <span className="text-outline/40">•</span>
                <span className="font-semibold uppercase text-xs tracking-wider text-primary">
                  {organization.type_label || organization.type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-sm justify-center">
            {isSubscribed ? (
              <button
                onClick={handleUnsubscribe}
                disabled={unsubscribeMutation.isPending}
                className="inline-flex items-center gap-xs px-lg py-sm bg-surface-bright/70 border border-outline-variant/40 text-on-surface rounded-lg font-bold hover:bg-error/10 hover:text-error hover:border-error/20 transition-all text-sm disabled:opacity-50"
              >
                <BellOff className="w-4 h-4" />
                <span>{unsubscribeMutation.isPending ? 'A cancelar...' : 'Cancelar subscrição'}</span>
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className="btn-primary inline-flex items-center gap-xs px-lg py-sm text-sm rounded-lg font-bold transition-all disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                <span>{subscribeMutation.isPending ? 'A subscrever...' : 'Subscrever'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/20 gap-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-sm px-md text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Resumo Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-sm px-md text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Histórico & Torneios ({history?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-lg">
            {/* Left Column: Stats & Description */}
            <div className="col-span-12 lg:col-span-8 space-y-lg">
              {/* Description */}
              <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
                <h3 className="font-title-md text-lg text-on-surface flex items-center gap-xs">
                  <Info className="w-4 h-4 text-primary" />
                  <span>Sobre</span>
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line text-sm">
                  {organization.description || 'Esta organização ainda não forneceu uma descrição de apresentação.'}
                </p>
              </div>

              {/* KPIs widgets */}
              {kpis ? (
                <div className="space-y-md">
                  <h3 className="font-title-md text-lg text-on-surface flex items-center gap-xs">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                    <span>Estatísticas Atuais</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                    <KpiCard
                      label="Torneios Totais"
                      value={kpis.total_tournaments}
                      icon={<Trophy className="w-4 h-4" />}
                    />
                    <KpiCard
                      label="Torneios Ativos"
                      value={kpis.active_tournaments}
                      icon={<Trophy className="w-4 h-4" />}
                    />
                    <KpiCard
                      label="Clubes Registados"
                      value={kpis.total_clubs}
                      icon={<Users className="w-4 h-4" />}
                    />
                    <KpiCard
                      label="Jogos Realizados"
                      value={kpis.total_games}
                    />
                    <KpiCard
                      label="Golos Marcados"
                      value={kpis.total_goals}
                    />
                    <KpiCard
                      label="Subscritores Ativos"
                      value={kpis.active_subscribers}
                      icon={<Users className="w-4 h-4" />}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-lg bg-surface-container/20 rounded-xl text-center text-on-surface-variant text-xs italic">
                  Estatísticas de torneio indisponíveis.
                </div>
              )}
            </div>

            {/* Right Column: Contact info */}
            <div className="col-span-12 lg:col-span-4 space-y-md">
              <h3 className="font-title-md text-lg text-on-surface flex items-center gap-xs">
                <Globe className="w-4 h-4 text-primary" />
                <span>Contactos</span>
              </h3>

              <div className="glass-card p-lg border border-outline-variant/30 space-y-md text-sm">
                {organization.email && (
                  <div className="flex gap-md items-start">
                    <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-outline uppercase tracking-wider font-semibold">Email Oficial</p>
                      <a href={`mailto:${organization.email}`} className="text-on-surface hover:text-primary hover:underline transition-colors block truncate font-medium">
                        {organization.email}
                      </a>
                    </div>
                  </div>
                )}

                {organization.phone && (
                  <div className="flex gap-md items-start">
                    <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-outline uppercase tracking-wider font-semibold">Contacto Telefónico</p>
                      <a href={`tel:${organization.phone}`} className="text-on-surface hover:text-primary hover:underline transition-colors block font-medium">
                        {organization.phone}
                      </a>
                    </div>
                  </div>
                )}

                {organization.website && (
                  <div className="flex gap-md items-start">
                    <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-outline uppercase tracking-wider font-semibold">Sítio Web</p>
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface hover:text-primary hover:underline transition-colors block truncate font-medium"
                      >
                        {organization.website}
                      </a>
                    </div>
                  </div>
                )}

                {!organization.email && !organization.phone && !organization.website && (
                  <p className="text-on-surface-variant text-xs italic text-center py-4">
                    Nenhum canal de contacto registado.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-lg animate-fade-in">
            {history && history.length > 0 ? (
              <OrganizationHistoryTable history={history} />
            ) : (
              <div className="glass-card p-xl border border-outline-variant/30 text-center py-16">
                <Trophy className="w-12 h-12 text-outline mx-auto mb-md opacity-40" />
                <h4 className="font-title-md text-base text-on-surface mb-xs">Sem Histórico Registado</h4>
                <p className="text-body-md text-on-surface-variant text-sm max-w-sm mx-auto">
                  Esta organização ainda não possui nenhuma época concluída ou campeões averbados no sistema.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
