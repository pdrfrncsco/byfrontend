import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicOrganizations } from '../hooks'
import type { PublicOrganization } from '../types'

export function OrganizationListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data: organizations, isLoading } = usePublicOrganizations({
    search: search || undefined,
    type: typeFilter || undefined,
  })

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-7xl mx-auto px-gutter py-xl">
        {/* Header */}
        <div className="mb-xl">
          <h1 className="font-display-lg text-headline-lg mb-sm text-primary">Organizações</h1>
          <p className="text-body-lg text-on-surface-variant">
            Descubra federações, associações e ligas registadas na plataforma
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-md mb-lg flex-wrap">
          <input
            type="text"
            placeholder="Pesquisar organizações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[250px] px-md py-sm rounded-lg border border-outline-variant bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-md py-sm rounded-lg border border-outline-variant bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os tipos</option>
            <option value="federation">Federação</option>
            <option value="association">Associação</option>
            <option value="league">Liga</option>
            <option value="organizer">Organizador</option>
            <option value="academy">Academia</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-xl">
            <p className="text-on-surface-variant">A carregar organizações...</p>
          </div>
        )}

        {/* Organizations Grid */}
        {!isLoading && organizations && organizations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {organizations.map((org: PublicOrganization) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && organizations?.length === 0 && (
          <div className="text-center py-xl">
            <p className="text-on-surface-variant">Nenhuma organização encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrganizationCard({ organization }: { organization: PublicOrganization }) {
  return (
    <Link
      to={`/organizations/${organization.slug}`}
      className="block bg-surface-container rounded-lg border border-outline-variant p-lg hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-md mb-md">
        {organization.logo_url ? (
          <img
            src={organization.logo_url}
            alt={organization.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-title-md">
            {organization.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-title-md text-title-md truncate text-on-surface">{organization.name}</h3>
          <p className="text-body-sm text-on-surface-variant">{organization.type_label}</p>
        </div>
        {organization.verified && (
          <span className="text-primary text-lg">✓</span>
        )}
      </div>

      <div className="flex items-center gap-sm text-body-sm text-on-surface-variant mb-sm">
        <span>{organization.location}</span>
      </div>

      <div className="flex gap-lg text-body-sm">
        <div>
          <span className="text-on-surface font-bold">{organization.active_subscribers}</span>
          <span className="text-on-surface-variant ml-xs">subscritores</span>
        </div>
      </div>
    </Link>
  )
}
