import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  useOrganizationMe,
  useOrganizationKpis,
  useOrganizationClubs,
  useOrganizationTournaments,
} from '@/modules/organizations'
import type { Organization } from '@/modules/organizations/types'
import { MapPin, Settings } from 'lucide-react'
import TransferItem from '../components/TransferItem'

export default function OrganizationDashboardPage() {
  const { data: organization } = useOrganizationMe()
  const org = organization as Organization | undefined
  const slug = org?.slug
  const { data: kpis } = useOrganizationKpis(slug)
  const { data: clubs } = useOrganizationClubs(slug)
  const { data: tournaments } = useOrganizationTournaments(slug)

  const headerActions = (
    <Link
      to={ROUTES.ONBOARDING + '/competition'}
      className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold flex items-center gap-sm hover:brightness-110 transition-all text-xs"
    >
      Criar Competição
    </Link>
  )

  const sidebarLinks = [
    { label: 'Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <MapPin className="w-4 h-4" />, active: true },
    { label: 'Clubes', href: ROUTES.CLUBS, icon: <MapPin className="w-4 h-4" /> },
    { label: 'Competições', href: ROUTES.ONBOARDING + '/competition', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout
      title={org ? `Portal — ${org.name}` : 'Portal da Organização'}
      subtitle="Painel administrativo de gestão de clubes, competições e estatísticas"
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs tracking-tight">
            {org ? `Bem-vindo, ${org.name}` : 'Bem-vindo'}
          </h1>
          <p className="text-on-surface-variant font-body-md">
            Resumo operacional e estado do sistema para a sua organização.
          </p>
        </div>

        <div className="flex gap-md">
          <div className="glass-card px-lg py-md rounded-xl flex flex-col min-w-[140px]">
            <span className="text-label-sm text-outline uppercase tracking-wider">Competições Ativas</span>
            <span className="font-headline-lg text-headline-lg text-primary">{kpis?.active_tournaments ?? '-'}</span>
          </div>

          <div className="glass-card px-lg py-md rounded-xl flex flex-col min-w-[140px]">
            <span className="text-label-sm text-outline uppercase tracking-wider">Clubes Registados</span>
            <span className="font-headline-lg text-headline-lg text-primary">
              {kpis?.total_clubs ?? (Array.isArray(clubs) ? clubs.length : '-')}
            </span>
          </div>

          <div className="glass-card px-lg py-md rounded-xl flex flex-col min-w-[140px]">
            <span className="text-label-sm text-outline uppercase tracking-wider">Subscritores</span>
            <span className="font-headline-lg text-headline-lg text-primary">{kpis?.active_subscribers ?? '-'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 glass-card rounded-xl border border-outline-variant">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-md text-title-md flex items-center gap-sm">Competições</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant">
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Nome</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Tipo</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Época</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="font-body-md divide-y divide-outline-variant/20">
                {(tournaments || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-lg py-md text-on-surface-variant">
                      Nenhuma competição registada.{' '}
                      <Link to={ROUTES.ONBOARDING + '/competition'} className="text-primary underline">
                        Configurar competição
                      </Link>
                    </td>
                  </tr>
                ) : (
                  (tournaments as Array<Record<string, string>>).map(t => (
                    <tr key={t.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-lg py-md font-title-md">{t.name}</td>
                      <td className="px-lg py-md text-on-surface-variant">{t.type_label || t.competition_type}</td>
                      <td className="px-lg py-md">{t.season}</td>
                      <td className="px-lg py-md text-primary">{t.status_label || t.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-card rounded-xl flex flex-col border border-outline-variant">
          <div className="p-md border-b border-outline-variant">
            <h3 className="font-title-md text-title-md">Transferências Recentes</h3>
          </div>
          <div className="p-md space-y-md text-on-surface-variant text-sm">
            Módulo de transferências em breve.
            <TransferItem playerName="—" fromClub="—" toClub="—" timeAgo="—" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
