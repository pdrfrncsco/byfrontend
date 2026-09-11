import React from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import { resolveMediaUrl } from '@/lib/media'

export interface ClubSquadTableProps {
  squad: any[]
  clubSlug: string
}

function getPlayerSector(pos?: string | null): 'GK' | 'DEF' | 'MID' | 'FWD' | 'OUTROS' {
  if (!pos) return 'OUTROS'
  const p = pos.toLowerCase()
  if (p === 'gk' || p.includes('guarda') || p.includes('redes') || p.includes('goleiro')) return 'GK'
  if (
    p === 'def' || p === 'df' || p.includes('defesa') || p.includes('lateral') ||
    p.includes('zagueiro') || p.includes('central') || p.includes('cb') || p.includes('lb') || p.includes('rb')
  ) {
    return 'DEF'
  }
  if (
    p === 'mid' || p === 'mf' || p.includes('médio') || p.includes('medio') ||
    p.includes('campo') || p.includes('volante') || p.includes('cm') || p.includes('cdm') || p.includes('cam')
  ) {
    return 'MID'
  }
  if (
    p === 'fwd' || p === 'att' || p === 'fw' || p.includes('avan') || p.includes('atac') ||
    p.includes('ponta') || p.includes('extremo') || p.includes('st') || p.includes('cf') || p.includes('lw') || p.includes('rw')
  ) {
    return 'FWD'
  }
  return 'OUTROS'
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

  // Group by sector
  const sectors: Array<{ key: 'GK' | 'DEF' | 'MID' | 'FWD' | 'OUTROS'; label: string; color: string }> = [
    { key: 'GK', label: 'Guarda-redes', color: 'bg-[#f59e0b]' },
    { key: 'DEF', label: 'Defesas', color: 'bg-[#3b82f6]' },
    { key: 'MID', label: 'Médios', color: 'bg-[#10b981]' },
    { key: 'FWD', label: 'Avançados', color: 'bg-[#ef4444]' },
    { key: 'OUTROS', label: 'Outros Jogadores', color: 'bg-gray-400' },
  ]

  const groupedSquad = sectors.reduce((acc, sec) => {
    const playersInSec = squad.filter((p) => getPlayerSector(p.position || p.position_label) === sec.key)
    if (playersInSec.length > 0) {
      acc.push({ ...sec, players: playersInSec })
    }
    return acc
  }, [] as Array<{ key: string; label: string; color: string; players: any[] }>)

  const calculateAge = (dob?: string | null) => {
    if (!dob) return '—'
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return '—'
    const diff_ms = Date.now() - birthDate.getTime()
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
              <React.Fragment key={group.key}>
                {/* Group Header */}
                <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                  <td colSpan={8} className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {group.label}
                  </td>
                </tr>
                {/* Players */}
                {group.players.map((player) => {
                  const name = player.display_name || player.full_name || player.name || 'Jogador'
                  const rawPhoto = player.photo_url || player.avatar
                  const photoUrl = rawPhoto ? resolveMediaUrl(rawPhoto) : null
                  const initials = name ? name.trim().slice(0, 2).toUpperCase() : '??'
                  const playerTarget = player.player_slug || player.slug || player.player_id || player.id
                  const positionDisplay = player.position_label || player.position || '—'

                  return (
                    <tr 
                      key={player.id || playerTarget} 
                      className="border-b border-outline-variant/8 transition-colors hover:bg-surface-container-low/50"
                    >
                      <td className="px-3 py-2 flex justify-center">
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt={name} 
                            className="w-7 h-7 rounded-full object-cover bg-surface-container-low border border-outline-variant/20"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-medium text-on-surface-variant">
                            {initials}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <Link 
                          to={`/players/${playerTarget}`}
                          className="font-medium text-on-surface hover:text-primary transition-colors"
                        >
                          {name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-sm text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full", group.color)} />
                          <span className="text-xs">{positionDisplay}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-on-surface-variant">
                        {calculateAge(player.date_of_birth)}
                      </td>
                      <td className="px-3 py-2 text-sm text-center font-medium">
                        {player.jersey_number ?? '—'}
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
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
