import { Loader2, User as UserIcon } from 'lucide-react'
import { usePlayerStats } from '../hooks'
import type { PlayerStats } from '../types'

export function PlayerStatsTable({ competitionId }: { competitionId: string }) {
  const { data: stats = [], isLoading } = usePlayerStats(competitionId)

  if (isLoading) {
    return (
      <div className="comp-loading">
        <Loader2 size={28} className="spin" />
        <span>A carregar estatísticas...</span>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="comp-empty">
        <UserIcon size={40} />
        <p>Nenhuma estatística registada.</p>
      </div>
    )
  }

  return (
    <div className="comp-standings-wrapper">
      <table className="comp-standings-table">
        <thead>
          <tr>
            <th className="comp-th comp-th--pos">#</th>
            <th className="comp-th comp-th--club">Jogador</th>
            <th className="comp-th">Clube</th>
            <th className="comp-th">Golos</th>
            <th className="comp-th">Autogolos</th>
            <th className="comp-th">CA</th>
            <th className="comp-th">CV</th>
            <th className="comp-th">Jogos</th>
          </tr>
        </thead>
        <tbody>
          {(stats as PlayerStats[]).map((s, idx) => (
            <tr key={s.player_id} className="comp-standing-row">
              <td className="comp-td comp-td--pos">{idx + 1}</td>
              <td className="comp-td comp-td--club">
                <div className="comp-standing-club">
                  {s.player__avatar ? (
                    <img src={s.player__avatar} alt="" className="comp-club-logo-sm" style={{ borderRadius: '50%' }} />
                  ) : (
                    <div className="comp-club-logo-sm" style={{ borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserIcon size={12} color="#aaa" />
                    </div>
                  )}
                  <span>{s.player__first_name} {s.player__last_name}</span>
                </div>
              </td>
              <td className="comp-td">{s.club__name}</td>
              <td className="comp-td" style={{ fontWeight: 600 }}>{s.goals}</td>
              <td className="comp-td">{s.own_goals}</td>
              <td className="comp-td" style={{ color: '#eab308' }}>{s.yellow_cards}</td>
              <td className="comp-td" style={{ color: '#ef4444' }}>{s.red_cards}</td>
              <td className="comp-td">{s.appearances}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
