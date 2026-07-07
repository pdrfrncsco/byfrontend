import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  useOrganizationMe,
  useOrganizationKpis,
  useOrganizationClubs,
  useOrganizationTournaments,
} from '../hooks'
import { KpiCard, SkeletonBase } from '../components'
import { Settings, Trophy, Users, PlusCircle, ArrowRight, Shield } from 'lucide-react'
import TransferItem from '../components/TransferItem'

export default function OrganizationDashboardPage() {
  const { data: org, isLoading: isLoadingOrg } = useOrganizationMe()
  const slug = org?.slug

  const { data: kpis, isLoading: isLoadingKpis } = useOrganizationKpis(slug)
  const { data: clubs, isLoading: isLoadingClubs } = useOrganizationClubs(slug)
  const { data: tournaments, isLoading: isLoadingTournaments } = useOrganizationTournaments(slug)

  const headerActions = (
    <Link
      to={ROUTES.ONBOARDING + '/competition'}
      className="btn-primary py-1.5 px-md text-xs rounded-lg font-bold flex items-center gap-xs"
    >
      <PlusCircle className="w-4 h-4" />
      <span>Criar Competição</span>
    </Link>
  )

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="w-4 h-4" />, active: true },
    { label: 'Clubes Associados', href: ROUTES.CLUBS, icon: <Shield className="w-4 h-4" /> },
    { label: 'Competições', href: ROUTES.ONBOARDING + '/competition', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="w-4 h-4" /> },
  ]

  const isLoadingAny = isLoadingOrg || isLoadingKpis || isLoadingTournaments || isLoadingClubs

  // Resolve status style
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('active') || s.includes('curso') || s.includes('live')) {
      return <span className="px-sm py-0.5 rounded bg-primary-container/20 text-primary text-xs font-semibold">Em Curso</span>
    }
    if (s.includes('complete') || s.includes('concl')) {
      return <span className="px-sm py-0.5 rounded bg-tertiary-container/20 text-tertiary text-xs font-semibold">Concluído</span>
    }
    return <span className="px-sm py-0.5 rounded bg-surface-bright border border-outline-variant/30 text-on-surface-variant text-xs font-semibold">Planeado</span>
  }

  return (
    <DashboardLayout
      title={org ? `Portal — ${org.name}` : 'Portal da Organização'}
      subtitle="Painel administrativo de gestão de clubes, competições e estatísticas"
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      {/* Welcome Banner / Overview */}
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg animate-fade-in">
        <div>
          <h1 className="font-display-lg text-3xl text-on-surface mb-xs tracking-tight leading-none">
            {org ? `Bem-vindo, ${org.name}` : 'Bem-vindo'}
          </h1>
          <p className="text-on-surface-variant text-sm font-body-md">
            Consola operacional e resumo analítico da sua organização.
          </p>
        </div>

        {/* Dashboard Top KPIs */}
        <div className="flex gap-md w-full md:w-auto">
          {isLoadingAny ? (
            <>
              <SkeletonBase className="h-20 w-32 rounded-xl" />
              <SkeletonBase className="h-20 w-32 rounded-xl" />
              <SkeletonBase className="h-20 w-32 rounded-xl" />
            </>
          ) : (
            <>
              <KpiCard
                label="Torneios Ativos"
                value={kpis?.active_tournaments ?? 0}
                icon={<Trophy className="w-4 h-4" />}
                className="min-w-[120px] flex-1 md:flex-none py-md px-lg"
              />

              <KpiCard
                label="Clubes"
                value={kpis?.total_clubs ?? (Array.isArray(clubs) ? clubs.length : 0)}
                icon={<Shield className="w-4 h-4" />}
                className="min-w-[120px] flex-1 md:flex-none py-md px-lg"
              />

              <KpiCard
                label="Subscritores"
                value={kpis?.active_subscribers ?? 0}
                icon={<Users className="w-4 h-4" />}
                className="min-w-[120px] flex-1 md:flex-none py-md px-lg"
              />
            </>
          )}
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-12 gap-lg animate-fade-in">
        {/* Competitions table - col-12 lg-8 */}
        <div className="col-span-12 lg:col-span-8 glass-card p-0 border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-md border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-md text-base flex items-center gap-xs text-on-surface">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Competições Organizacionais</span>
              </h3>
              <Link to={ROUTES.ONBOARDING + '/competition'} className="text-xs font-semibold text-primary hover:underline flex items-center gap-xs">
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/20">
                    <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider text-[10px]">Nome</th>
                    <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider text-[10px]">Formato</th>
                    <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider text-[10px]">Época</th>
                    <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider text-[10px]">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {isLoadingAny ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-lg py-md"><SkeletonBase className="h-4 w-40" /></td>
                        <td className="px-lg py-md"><SkeletonBase className="h-4 w-20" /></td>
                        <td className="px-lg py-md"><SkeletonBase className="h-4 w-12" /></td>
                        <td className="px-lg py-md"><SkeletonBase className="h-4 w-16" /></td>
                      </tr>
                    ))
                  ) : (tournaments || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-lg py-xl text-center text-on-surface-variant">
                        <p className="mb-md">Nenhuma competição configurada de momento.</p>
                        <Link
                          to={ROUTES.ONBOARDING + '/competition'}
                          className="btn-primary px-md py-sm text-xs rounded-lg inline-flex items-center gap-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Configurar Competição</span>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    (tournaments as any[]).map(t => (
                      <tr key={t.id} className="hover:bg-surface-container-high/40 transition-colors">
                        <td className="px-lg py-md font-semibold text-on-surface">{t.name}</td>
                        <td className="px-lg py-md text-on-surface-variant text-xs">{t.type_label || t.competition_type || 'Liga'}</td>
                        <td className="px-lg py-md font-data-tabular text-xs">{t.season}</td>
                        <td className="px-lg py-md">{getStatusBadge(t.status_label || t.status || 'active')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transfer segment / side card - col-12 lg-4 */}
        <div className="col-span-12 lg:col-span-4 glass-card border border-outline-variant/30 rounded-xl flex flex-col justify-between p-0">
          <div>
            <div className="p-md border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-md text-base flex items-center gap-xs text-on-surface">
                <Users className="w-5 h-5 text-primary" />
                <span>Movimentações & Transferências</span>
              </h3>
            </div>
            <div className="p-md space-y-md">
              <p className="text-xs text-on-surface-variant">
                Registo de transferências e renovações de contratos federativos.
              </p>
              
              <div className="space-y-sm">
                <TransferItem playerName="Manuel Neto" fromClub="Atlético de Luanda" toClub="1º de Agosto" timeAgo="2 horas atrás" />
                <TransferItem playerName="Gelson Kiala" fromClub="Sagrada Esperança" toClub="Petro de Luanda" timeAgo="Ontem" />
              </div>
            </div>
          </div>

          <div className="p-md border-t border-outline-variant/20 bg-surface-container/20">
            <Link
              to={ROUTES.TRANSFERS || '/transfers'}
              className="text-xs font-semibold text-primary hover:text-primary-variant hover:underline flex items-center gap-xs justify-center"
            >
              <span>Ver painel de transferências</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
