import { Check, Circle, LockKeyhole, Play, Trophy, FileCheck2, Archive } from 'lucide-react'
import type { Match, MatchStatus } from '../types'
import { MatchStatusBadge } from './MatchStatusBadge'

const FLOW: Array<{ status: MatchStatus; label: string; description: string; icon: typeof Circle }> = [
  { status: 'scheduled', label: 'Agendada', description: 'Data e participantes definidos', icon: Circle },
  { status: 'pre_match', label: 'Pré-jogo', description: 'Escalações e validação', icon: LockKeyhole },
  { status: 'live', label: 'Ao vivo', description: 'Eventos e relógio em direto', icon: Play },
  { status: 'finished', label: 'Terminada', description: 'Resultado oficial', icon: Trophy },
  { status: 'archived', label: 'Arquivada', description: 'Histórico imutável', icon: Archive },
]

function stageIndex(status: MatchStatus) {
  if (status === 'halftime') return 2
  if (status === 'walkover' || status === 'cancelled' || status === 'postponed') return 0
  return Math.max(0, FLOW.findIndex((item) => item.status === status))
}

export function MatchLifecycleStepper({ match }: { match: Match }) {
  const currentIndex = stageIndex(match.status)
  const reportStatus = (match as any).report_status as string | undefined

  return (
    <section className="rounded-xl border border-outline-variant/20 bg-surface-container p-md" aria-label="Ciclo de vida da partida">
      <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Ciclo da partida</h2>
          <p className="text-xs text-on-surface-variant">O estado oficial controla as ações disponíveis para cada interveniente.</p>
        </div>
        <MatchStatusBadge status={match.status} currentMinute={match.current_minute} period={match.current_period as any} />
      </div>

      <div className="grid gap-sm sm:grid-cols-5">
        {FLOW.map((item, index) => {
          const Icon = item.icon
          const active = index === currentIndex
          const complete = index < currentIndex
          return (
            <div key={item.status} className={`relative rounded-lg border p-sm ${
              active ? 'border-primary bg-primary/10' : complete ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-outline-variant/20 bg-surface'
            }`}>
              <div className="flex items-center gap-xs">
                {complete ? <Check className="h-4 w-4 text-emerald-600" /> : <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-on-surface-variant'}`} />}
                <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-on-surface'}`}>{item.label}</span>
              </div>
              <p className="mt-xs text-[11px] text-on-surface-variant">{item.description}</p>
            </div>
          )
        })}
      </div>

      {reportStatus && (
        <div className="mt-md flex items-center gap-xs text-xs text-on-surface-variant">
          <FileCheck2 className="h-4 w-4" />
          Relatório: <span className="font-semibold text-on-surface">{reportStatus}</span>
        </div>
      )}
    </section>
  )
}
