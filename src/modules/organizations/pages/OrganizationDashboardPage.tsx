import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useOrganizationMe, useOrganizationKpis, useOrganizationClubs, useOrganizationTournaments } from '@/modules/organizations'
import { MapPin } from 'lucide-react'

export default function OrganizationDashboardPage() {
  const { data: organization } = useOrganizationMe()
  const slug = (organization as any)?.slug
  const { data: kpis } = useOrganizationKpis(slug)
  const { data: clubs } = useOrganizationClubs(slug)
  const { data: tournaments } = useOrganizationTournaments(slug)

  const headerActions = (
    <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold flex items-center gap-sm hover:brightness-110 transition-all text-xs">
      Criar Novo Campeonato
    </button>
  )

  const sidebarLinks = [
    { label: 'Geral', href: '#home', icon: <MapPin className="w-4 h-4" />, active: true },
    { label: 'Clubes', href: '/clubs', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Competições', href: '#competitions', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Transferências', href: '#transfers', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Configurações', href: '#settings', icon: <MapPin className="w-4 h-4" /> }
  ]

  return (
    <DashboardLayout
      title={organization ? `Portal — ${ (organization as any).name }` : 'Portal da Organização'}
      subtitle="Painel administrativo de gestão de clubes, competições e estatísticas"
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs tracking-tight">{organization ? `Bem-vindo, ${(organization as any).name}` : 'Bem-vindo'}</h1>
          <p className="text-on-surface-variant font-body-md">Resumo operacional e estado do sistema para a sua organização.</p>
        </div>

        <div className="flex gap-md">
          <div className="glass-card px-lg py-md rounded-xl flex flex-col min-w-[140px]">
            <span className="text-label-sm text-outline uppercase tracking-wider">Active Leagues</span>
            <span className="font-headline-lg text-headline-lg text-primary">{(kpis as any)?.active_competitions ?? '-'}</span>
          </div>

          <div className="glass-card px-lg py-md rounded-xl flex flex-col min-w-[140px]">
            <span className="text-label-sm text-outline uppercase tracking-wider">Registered Clubs</span>
            <span className="font-headline-lg text-headline-lg text-primary">{Array.isArray(clubs) ? clubs.length : (kpis as any)?.total_clubs ?? '-'}</span>
          </div>

          <div className="glass-card px-lg py-md rounded-xl flex flex-col min-w-[140px]">
            <span className="text-label-sm text-outline uppercase tracking-wider">Players</span>
            <span className="font-headline-lg text-headline-lg text-primary">{(kpis as any)?.squad_size ?? '-'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col border border-outline-variant">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-md text-title-md flex items-center gap-sm"><MapPin className="w-5 h-5 text-primary"/> Club Density: National Overview</h3>
            <div className="flex gap-xs">
              <span className="px-sm py-xs bg-surface-container-highest rounded text-label-sm text-primary">Luanda (High)</span>
              <span className="px-sm py-xs bg-surface-container-highest rounded text-label-sm">Benguela (Med)</span>
            </div>
          </div>
          <div className="relative h-[400px] bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
            <div>Mapa interativo — placeholder</div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-card rounded-xl flex flex-col border border-outline-variant h-full overflow-hidden">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-md text-title-md flex items-center gap-sm">🔁 Recent Transfers</h3>
            <button className="text-label-sm text-primary hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto p-md space-y-md">
            {/* Placeholder items - replace with real transfers API when available */}
            <div className="flex items-center gap-md p-sm hover:bg-surface-container-high rounded transition-all group">
              <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-primary font-bold">JD</div>
              <div className="flex-1 min-w-0">
                <p className="font-title-md text-body-md truncate">João Domingos</p>
                <p className="text-label-sm text-outline truncate">Petro de Luanda → 1º de Agosto</p>
              </div>
              <div className="text-right">
                <p className="font-data-tabular text-primary">Conf.</p>
                <p className="text-[10px] text-outline">2m ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 glass-card rounded-xl border border-outline-variant">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-md text-title-md flex items-center gap-sm">🏟️ Active Competition Management</h3>
            <div className="flex gap-sm">
              <button className="px-md py-xs bg-primary text-on-primary rounded text-label-sm font-bold">Register New</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant">
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Competition Name</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Type</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Status</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider text-center">Clubs</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider">Next Matchday</th>
                  <th className="px-lg py-md font-label-sm text-outline uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md divide-y divide-outline-variant/20">
                {(tournaments || []).map((t: any) => (
                  <tr key={t.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-lg py-md">
                      <p className="font-title-md">{t.name}</p>
                      <p className="text-[10px] text-outline">{t.description}</p>
                    </td>
                    <td className="px-lg py-md text-on-surface-variant font-data-tabular">{t.type || '—'}</td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <span className="w-2 h-2 bg-primary rounded-full status-live"></span>
                        <span className="text-primary font-bold text-label-sm uppercase tracking-tighter">{t.status || 'Planned'}</span>
                      </div>
                    </td>
                    <td className="px-lg py-md text-center font-data-tabular">{(t.clubs || []).length}/{t.max_clubs || '—'}</td>
                    <td className="px-lg py-md">{t.next_matchday || '—'}</td>
                    <td className="px-lg py-md text-right">
                      <button className="p-sm hover:text-primary transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
