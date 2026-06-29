import { useParams, Link } from 'react-router-dom'
import {
  usePublicOrganizationDetail,
  useOrganizationKpis,
  useOrganizationHistory,
  useSubscribeOrganization,
  useUnsubscribeOrganization,
} from '../hooks'

export function OrganizationDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: organization, isLoading: isLoadingOrg } = usePublicOrganizationDetail(slug)
  const { data: kpis } = useOrganizationKpis(slug)
  const { data: history } = useOrganizationHistory(slug)
  const subscribeMutation = useSubscribeOrganization()
  const unsubscribeMutation = useUnsubscribeOrganization()

  if (isLoadingOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">A carregar organização...</p>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">Organização não encontrada</p>
      </div>
    )
  }

  const handleSubscribe = () => {
    if (slug) subscribeMutation.mutate(slug)
  }

  const handleUnsubscribe = () => {
    if (slug) unsubscribeMutation.mutate(slug)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <div className="bg-surface-container border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-gutter py-xl">
          <Link
            to="/organizations"
            className="text-on-surface-variant hover:text-on-surface text-body-sm mb-md inline-block"
          >
            ← Voltar às organizações
          </Link>

          <div className="flex items-start gap-lg">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center text-on-primary-container font-display-lg"
                style={{ backgroundColor: organization.primary_color || '#014d40' }}
              >
                {organization.name.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-md mb-sm">
                <h1 className="font-display-lg text-headline-lg text-primary">{organization.name}</h1>
                {organization.verified && (
                  <span className="text-primary text-xl">✓</span>
                )}
              </div>

              <p className="text-body-md text-on-surface-variant mb-md">
                {organization.type_label} • {organization.location}
              </p>

              {organization.description && (
                <p className="text-body-md text-on-surface-variant mb-lg">
                  {organization.description}
                </p>
              )}

              <div className="flex gap-sm">
                <button
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending}
                  className="px-lg py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {subscribeMutation.isPending ? 'A subscrever...' : 'Subscrever'}
                </button>
                <button
                  onClick={handleUnsubscribe}
                  disabled={unsubscribeMutation.isPending}
                  className="px-lg py-sm border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                >
                  Cancelar subscrição
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="max-w-7xl mx-auto px-gutter py-xl">
          <h2 className="font-title-lg text-title-lg mb-lg text-on-surface">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md">
            <KpiCard label="Torneios Totais" value={kpis.total_tournaments} />
            <KpiCard label="Torneios Ativos" value={kpis.active_tournaments} />
            <KpiCard label="Clubes" value={kpis.total_clubs} />
            <KpiCard label="Jogos Totais" value={kpis.total_games} />
            <KpiCard label="Golos" value={kpis.total_goals} />
            <KpiCard label="Subscritores" value={kpis.active_subscribers} />
          </div>
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <div className="max-w-7xl mx-auto px-gutter py-xl">
          <h2 className="font-title-lg text-title-lg mb-lg text-on-surface">Histórico de Torneios</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-sm px-md text-on-surface-variant font-body-sm">Época</th>
                  <th className="py-sm px-md text-on-surface-variant font-body-sm">Torneio</th>
                  <th className="py-sm px-md text-on-surface-variant font-body-sm">Vencedor</th>
                  <th className="py-sm px-md text-on-surface-variant font-body-sm">Vice-campeão</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((entry, idx) => (
                  <tr key={idx} className="border-b border-outline-variant">
                    <td className="py-sm px-md">{entry.season}</td>
                    <td className="py-sm px-md">{entry.tournament_name}</td>
                    <td className="py-sm px-md text-primary">{entry.winner_club_name || '-'}</td>
                    <td className="py-sm px-md">{entry.runner_up_club_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="max-w-7xl mx-auto px-gutter py-xl">
        <h2 className="font-title-lg text-title-lg mb-lg text-on-surface">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {organization.email && (
            <div className="bg-surface-container rounded-lg p-lg border border-outline-variant">
              <p className="text-body-sm text-on-surface-variant mb-xs">Email</p>
              <a href={`mailto:${organization.email}`} className="text-primary hover:underline">
                {organization.email}
              </a>
            </div>
          )}
          {organization.phone && (
            <div className="bg-surface-container rounded-lg p-lg border border-outline-variant">
              <p className="text-body-sm text-on-surface-variant mb-xs">Telefone</p>
              <a href={`tel:${organization.phone}`} className="text-primary hover:underline">
                {organization.phone}
              </a>
            </div>
          )}
          {organization.website && (
            <div className="bg-surface-container rounded-lg p-lg border border-outline-variant">
              <p className="text-body-sm text-on-surface-variant mb-xs">Website</p>
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {organization.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container rounded-lg p-md border border-outline-variant text-center">
      <p className="font-display-lg text-headline-md text-on-surface">{value}</p>
      <p className="text-body-sm text-on-surface-variant">{label}</p>
    </div>
  )
}
