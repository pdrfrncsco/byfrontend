import React from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'

export interface ClubSquadTableProps {
  squad: any[]
  clubSlug: string
}

export function ClubSquadTable({ squad, clubSlug }: ClubSquadTableProps) {
  if (!squad || squad.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Plantel não disponível"
        description="Ainda não existem jogadores registados no plantel desta equipa."
      />
    )
  }

  // Group by position
  const positions = ['GK', 'DEF', 'MID', 'FWD']
  const groupedSquad = positions.reduce((acc, pos) => {
    const playersInPos = squad.filter((p) => p.position === pos)
    if (playersInPos.length > 0) {
      acc.push({ position: pos, players: playersInPos })
    }
    return acc
  }, [] as { position: string; players: any[] }[])
  
  // Also add players with unknown or other positions at the end
  const otherPlayers = squad.filter((p) => !positions.includes(p.position))
  if (otherPlayers.length > 0) {
    groupedSquad.push({ position: 'OUTROS', players: otherPlayers })
  }

  const getPositionLabel = (pos: string) => {
    switch(pos) {
      case 'GK': return 'Guarda-redes'
      case 'DEF': return 'Defesa'
      case 'MID': return 'Médio'
      case 'FWD': return 'Avançado'
      default: return 'Outro'
    }
  }

  const getPositionColor = (pos: string) => {
    switch(pos) {
      case 'GK': return 'bg-[#f59e0b]'
      case 'DEF': return 'bg-[#3b82f6]'
      case 'MID': return 'bg-[#10b981]'
      case 'FWD': return 'bg-[#ef4444]'
      default: return 'bg-gray-400'
    }
  }

  const calculateAge = (dob: string) => {
    if (!dob) return '—'
    const diff_ms = Date.now() - new Date(dob).getTime()
    const age_dt = new Date(diff_ms)
    return Math.abs(age_dt.getUTCFullYear() - 1970)
  }

  return (
    <div className="rounded-lg border border-outline-variant/15 bg-surface-container overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-outline-variant/15 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant bg-surface-container-low">
              <th className="px-3 py-2 w-12 text-center">Foto</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2 w-28">Posição</th>
              <th className="px-3 py-2 w-16 text-center">Idade</th>
              <th className="px-3 py-2 w-12 text-center">Nº</th>
              <th className="px-3 py-2 w-12 text-center" title="Jogos realizados">J</th>
              <th className="px-3 py-2 w-12 text-center" title="Golos">G</th>
              <th className="px-3 py-2 w-12 text-center" title="Assistências">A</th>
            </tr>
          </thead>
          <tbody>
            {groupedSquad.map((group) => (
              <React.Fragment key={group.position}>
                {/* Group Header */}
                <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                  <td colSpan={8} className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {getPositionLabel(group.position)}
                  </td>
                </tr>
                {/* Players */}
                {group.players.map((player) => (
                  <tr 
                    key={player.id} 
                    className="border-b border-outline-variant/8 transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-3 py-2 flex justify-center">
                      {player.photo_url ? (
                        <img 
                          src={player.photo_url} 
                          alt={player.name} 
                          className="w-7 h-7 rounded-full object-cover bg-surface-container-low border border-outline-variant/20"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-medium text-on-surface-variant">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <Link 
                        to={`/players/${player.slug || player.id}`}
                        className="font-medium text-on-surface hover:text-primary transition-colors"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", getPositionColor(player.position))} />
                        <span className="text-xs">{player.position}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-center text-on-surface-variant">
                      {calculateAge(player.date_of_birth)}
                    </td>
                    <td className="px-3 py-2 text-sm text-center font-medium">
                      {player.jersey_number || '—'}
                    </td>
                    <td className="px-3 py-2 text-sm text-center tabular-nums text-on-surface-variant">
                      {player.matches_played ?? 0}
                    </td>
                    <td className="px-3 py-2 text-sm text-center tabular-nums text-on-surface-variant">
                      {player.goals ?? 0}
                    </td>
                    <td className="px-3 py-2 text-sm text-center tabular-nums text-on-surface-variant">
                      {player.assists ?? 0}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
