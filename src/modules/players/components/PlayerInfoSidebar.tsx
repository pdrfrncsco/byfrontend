import { User, BarChart3, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  SportSidebar,
  SportSidebarCard,
  SportStatRow
} from '@/modules/shared/components/sport'
import { POSITION_COLOR } from '../constants'

/**
 * PlayerInfoSidebar component displays attributes, statistics, and club info in a sidebar.
 */
export interface PlayerInfoSidebarProps {
  player: any // PlayerDetail
}

export function PlayerInfoSidebar({ player }: PlayerInfoSidebarProps) {
  return (
    <SportSidebar>
      <SportSidebarCard title="Atributos" icon={<User className="h-4 w-4" />}>
        <SportStatRow label="Idade" value={player.age ?? '—'} />
        <SportStatRow label="Nacionalidade" value={player.nationality ?? '—'} />
        <SportStatRow label="Altura" value={player.height_cm ? `${player.height_cm} cm` : '—'} />
        <SportStatRow label="Peso" value={player.weight_kg ? `${player.weight_kg} kg` : '—'} />
        <SportStatRow 
          label="Pé" 
          value={player.foot ? player.foot.charAt(0).toUpperCase() + player.foot.slice(1) : '—'} 
        />
        <SportStatRow 
          label="Posição" 
          value={
            player.position_label ? (
              <div className="flex items-center gap-2">
                <span 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: POSITION_COLOR?.[player.primary_position] || '#ccc' }} 
                />
                {player.position_label}
              </div>
            ) : '—'
          } 
        />
      </SportSidebarCard>

      <SportSidebarCard title="Estatísticas" icon={<BarChart3 className="h-4 w-4" />}>
        <SportStatRow label="Jogos" value={player.total_matches ?? 0} />
        <SportStatRow 
          label="Golos" 
          value={
            <span className="text-amber-500 font-bold">
              {player.total_goals ?? 0}
            </span>
          } 
        />
        <SportStatRow 
          label="Assistências" 
          value={
            <span className="text-emerald-500 font-bold">
              {player.total_assists ?? 0}
            </span>
          } 
        />
        <SportStatRow label="Camisola" value={player.shirt_number ?? '—'} />
      </SportSidebarCard>

      {player.current_club && (
        <SportSidebarCard title="Clube Atual" icon={<Shield className="h-4 w-4" />}>
          <div className="mb-2">
            <Link 
              to={`/clubs/${player.current_club.slug}`}
              className="text-primary hover:underline font-medium"
            >
              {player.current_club.name}
            </Link>
          </div>
          <SportStatRow 
            label="Desde" 
            value={player.current_club.registered_since ? new Date(player.current_club.registered_since).toLocaleDateString() : '—'} 
          />
          <SportStatRow 
            label="Nº Camisola" 
            value={player.current_club.shirt_number ?? player.shirt_number ?? '—'} 
          />
        </SportSidebarCard>
      )}
    </SportSidebar>
  )
}
