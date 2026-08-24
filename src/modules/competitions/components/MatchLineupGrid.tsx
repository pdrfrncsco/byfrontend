import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Users } from 'lucide-react'
import type { LineupPlayer } from '../types'

export interface MatchLineupGridProps {
  formation?: string
  starters: LineupPlayer[]
  substitutes: LineupPlayer[]
  editable?: boolean
  children: ReactNode
}

export function MatchLineupGrid({ formation, starters, substitutes, editable = false, children }: MatchLineupGridProps) {
  const hasPlayers = starters.length > 0 || substitutes.length > 0
  const ineligibleCount = [...starters, ...substitutes].filter(player => player.eligible === false).length
  const missingGoalkeeper = !starters.some(player => player.position === 'GK' || player.is_goalkeeper)

  return (
    <section className="space-y-lg" aria-label="Escalação da equipa">
      {(hasPlayers || editable) && (
        <div className="flex flex-wrap items-center justify-between gap-sm rounded-lg border border-outline-variant/20 bg-surface-container-low px-md py-sm">
          <div className="flex items-center gap-sm text-sm text-on-surface-variant">
            <Users className="h-4 w-4" />
            <span>{starters.length} titulares · {substitutes.length} suplentes</span>
          </div>
          {formation && <span className="font-mono text-sm font-semibold text-primary"> {formation}</span>}
          {editable && <span className="text-xs font-medium text-primary">Modo de edição</span>}
        </div>
      )}

      {(ineligibleCount > 0 || (missingGoalkeeper && starters.length > 0)) && (
        <div className="flex items-start gap-sm rounded-lg border border-amber-500/30 bg-amber-500/10 p-md text-sm text-amber-800" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            {ineligibleCount > 0 && <p>{ineligibleCount} jogador(es) com elegibilidade pendente.</p>}
            {missingGoalkeeper && starters.length > 0 && <p>O onze inicial ainda não tem guarda-redes identificado.</p>}
          </div>
        </div>
      )}

      {ineligibleCount === 0 && !missingGoalkeeper && starters.length > 0 && (
        <div className="flex items-center gap-xs text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Escalação elegível
        </div>
      )}

      <div className="space-y-lg">{children}</div>
    </section>
  )
}
