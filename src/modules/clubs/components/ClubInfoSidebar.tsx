import React from 'react'
import { Link } from 'react-router-dom'
import { Info, BarChart3, Trophy, Heart } from 'lucide-react'
import { 
  SportSidebar, 
  SportSidebarCard, 
  SportStatRow 
} from '@/modules/shared/components/sport'
import { Badge } from '@/components/ui/badge'

export interface ClubInfoSidebarProps {
  club: any
  kpis?: any
  competitions?: any[]
  sponsors?: any[]
}

export function ClubInfoSidebar({ 
  club, 
  kpis, 
  competitions = [], 
  sponsors = [] 
}: ClubInfoSidebarProps) {
  
  const hasKpis = kpis && Object.keys(kpis).length > 0
  const hasCompetitions = competitions.length > 0
  const hasSponsors = sponsors.length > 0

  return (
    <SportSidebar>
      {/* Informação */}
      <SportSidebarCard title="Informação" icon={Info}>
        <div className="space-y-1">
          {club.foundation_year && <SportStatRow label="Fundação" value={club.foundation_year} />}
          {club.stadium_name && <SportStatRow label="Estádio" value={club.stadium_name} />}
          {club.stadium_capacity && <SportStatRow label="Capacidade" value={club.stadium_capacity.toLocaleString()} />}
          {club.city && <SportStatRow label="Cidade" value={club.city} />}
          {club.country && <SportStatRow label="País" value={club.country} />}
          {club.website && (
            <SportStatRow 
              label="Website" 
              value={
                <a 
                  href={club.website.startsWith('http') ? club.website : `https://${club.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate max-w-[150px] inline-block"
                >
                  {club.website.replace(/^https?:\/\//, '')}
                </a>
              } 
            />
          )}
          {club.email && <SportStatRow label="Email" value={<span className="truncate max-w-[150px]">{club.email}</span>} />}
        </div>
      </SportSidebarCard>

      {/* Estatísticas */}
      {hasKpis && (
        <SportSidebarCard title="Estatísticas" icon={BarChart3}>
          <div className="space-y-1">
            <SportStatRow label="Plantel" value={kpis.squad_size ?? '—'} />
            <SportStatRow label="Staff" value={kpis.staff_count ?? '—'} />
            <SportStatRow label="Jogos" value={kpis.total_matches ?? 0} />
            <SportStatRow label="Vitórias" value={kpis.wins ?? 0} />
            <SportStatRow label="Empates" value={kpis.draws ?? 0} />
            <SportStatRow label="Derrotas" value={kpis.losses ?? 0} />
            <SportStatRow label="Golos Marcados" value={kpis.goals_for ?? 0} />
            <SportStatRow label="Golos Sofridos" value={kpis.goals_against ?? 0} />
          </div>
        </SportSidebarCard>
      )}

      {/* Competições */}
      {hasCompetitions && (
        <SportSidebarCard title="Competições" icon={Trophy}>
          <div className="flex flex-col gap-2 pt-1">
            {competitions.map((comp) => (
              <Link 
                key={comp.id}
                to={`/competitions/${comp.id}`}
                className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-colors group"
              >
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors truncate pr-2">
                  {comp.name}
                </span>
                {comp.type && (
                  <Badge variant="outline" className="text-[9px] uppercase bg-surface whitespace-nowrap">
                    {comp.type}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </SportSidebarCard>
      )}

      {/* Patrocinadores */}
      {hasSponsors && (
        <SportSidebarCard title="Patrocinadores" icon={Heart}>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {sponsors.map((sponsor) => (
              <div 
                key={sponsor.id} 
                className="flex flex-col items-center justify-center p-2 rounded bg-surface-container-low border border-outline-variant/10"
                title={sponsor.name}
              >
                {sponsor.logo_url ? (
                  <img 
                    src={sponsor.logo_url} 
                    alt={sponsor.name} 
                    className="max-h-8 max-w-full object-contain mb-1"
                  />
                ) : (
                  <div className="h-8 flex items-center justify-center mb-1">
                    <span className="text-xs font-medium text-on-surface-variant truncate w-full text-center">
                      {sponsor.name.substring(0, 10)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SportSidebarCard>
      )}
    </SportSidebar>
  )
}
