import { Trophy } from 'lucide-react'
import type { OrganizationHistoryEntry } from '../types'

interface OrganizationHistoryTableProps {
  history: OrganizationHistoryEntry[]
}

export function OrganizationHistoryTable({ history }: OrganizationHistoryTableProps) {
  return (
    <div className="glass-card rounded-xl border border-outline-variant/30 overflow-hidden">
      <div className="p-md border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
        <h3 className="font-title-md text-title-md flex items-center gap-sm text-on-surface">
          <Trophy className="w-5 h-5 text-tertiary" />
          <span>Histórico de Campeões</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr className="bg-surface-container border-b border-outline-variant/30">
              <th className="py-md px-lg font-label-sm text-outline uppercase tracking-wider text-xs">Época</th>
              <th className="py-md px-lg font-label-sm text-outline uppercase tracking-wider text-xs">Torneio</th>
              <th className="py-md px-lg font-label-sm text-outline uppercase tracking-wider text-xs">Campeão 🏆</th>
              <th className="py-md px-lg font-label-sm text-outline uppercase tracking-wider text-xs">Vice-Campeão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-body-md text-sm">
            {history.slice(0, 10).map((entry, idx) => (
              <tr
                key={idx}
                className="hover:bg-surface-container-high transition-colors duration-200"
                role="row"
              >
                <td className="py-md px-lg text-on-surface font-semibold">{entry.season}</td>
                <td className="py-md px-lg text-on-surface-variant font-medium">{entry.tournament_name}</td>
                <td className="py-md px-lg text-primary font-bold">{entry.winner_club_name || '—'}</td>
                <td className="py-md px-lg text-on-surface-variant">{entry.runner_up_club_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
