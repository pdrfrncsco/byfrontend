import { useEffect, useState } from 'react'
import { BarChart3, Check, Loader2, Pencil, X } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import type { MatchStats, TeamMatchStats } from '../types'

type EditableMetric = Exclude<keyof TeamMatchStats, 'teamId'>

const METRICS: Array<{ label: string; key: EditableMetric; suffix?: string }> = [
  { label: 'Posse', key: 'possession', suffix: '%' },
  { label: 'Remates', key: 'shots' },
  { label: 'Remates à baliza', key: 'shotsOnTarget' },
  { label: 'Cantos', key: 'corners' },
  { label: 'Faltas', key: 'fouls' },
  { label: 'Fora de jogo', key: 'offsides' },
  { label: 'Cartões amarelos', key: 'yellowCards' },
  { label: 'Cartões vermelhos', key: 'redCards' },
  { label: 'Passes', key: 'passes' },
  { label: 'Precisão de passe', key: 'passAccuracy', suffix: '%' },
]

interface MatchStatsWorkspaceProps {
  stats: MatchStats | null
  homeName: string
  awayName: string
  homeTeamId: string
  awayTeamId: string
  canEdit: boolean
  isLoading?: boolean
  isUpdating?: boolean
  updateStats: (teamId: string, data: Partial<TeamMatchStats>) => Promise<void>
}

type Draft = Record<EditableMetric, number>

function toDraft(team?: TeamMatchStats): Draft {
  return METRICS.reduce((draft, metric) => ({ ...draft, [metric.key]: Number(team?.[metric.key] ?? 0) }), {} as Draft)
}

function validate(draft: Draft) {
  return METRICS.every(metric => Number.isFinite(draft[metric.key]) && draft[metric.key] >= 0 && (metric.key !== 'possession' && metric.key !== 'passAccuracy' || draft[metric.key] <= 100))
}

export function MatchStatsWorkspace({ stats, homeName, awayName, homeTeamId, awayTeamId, canEdit, isLoading = false, isUpdating = false, updateStats }: MatchStatsWorkspaceProps) {
  const [editing, setEditing] = useState(false)
  const [homeDraft, setHomeDraft] = useState<Draft>(toDraft(stats?.home))
  const [awayDraft, setAwayDraft] = useState<Draft>(toDraft(stats?.away))

  useEffect(() => {
    if (!editing) {
      setHomeDraft(toDraft(stats?.home))
      setAwayDraft(toDraft(stats?.away))
    }
  }, [stats, editing])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate(homeDraft) || !validate(awayDraft)) return
    await Promise.all([updateStats(homeTeamId, homeDraft), updateStats(awayTeamId, awayDraft)])
    setEditing(false)
  }

  if (isLoading) return <Card variant="flat" padding="lg"><div className="h-64 animate-pulse rounded-lg bg-surface-container-high" /></Card>

  return (
    <Card variant="flat" padding="lg">
      <div className="space-y-lg">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <div><h2 className="flex items-center gap-sm text-lg font-semibold text-on-surface"><BarChart3 className="h-5 w-5 text-primary" />Estatísticas da partida</h2><p className="mt-xs text-xs text-on-surface-variant">Dados comparativos por equipa. Os valores podem ser actualizados pelo operador autorizado.</p></div>
          {canEdit && !editing && <Button variant="secondary" size="sm" onClick={() => setEditing(true)}><Pencil className="mr-xs h-4 w-4" />Editar</Button>}
        </div>
        {editing ? (
          <form onSubmit={save} className="space-y-md">
            <div className="grid gap-md sm:grid-cols-2">
              {[{ label: homeName, draft: homeDraft, setDraft: setHomeDraft }, { label: awayName, draft: awayDraft, setDraft: setAwayDraft }].map(team => (
                <div key={team.label} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-md"><h3 className="mb-sm text-sm font-semibold text-on-surface">{team.label}</h3><div className="grid grid-cols-2 gap-sm">{METRICS.map(metric => <label key={metric.key} className="text-xs text-on-surface-variant">{metric.label}<input type="number" min="0" max={metric.key === 'possession' || metric.key === 'passAccuracy' ? 100 : undefined} value={team.draft[metric.key]} onChange={event => team.setDraft({ ...team.draft, [metric.key]: Number(event.target.value) })} className="mt-xs w-full rounded-lg border border-outline-variant/30 bg-surface px-sm py-xs text-sm text-on-surface" /></label>)}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-sm"><Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}><X className="mr-xs h-4 w-4" />Cancelar</Button><Button type="submit" variant="primary" size="sm" disabled={isUpdating}>{isUpdating ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Check className="mr-xs h-4 w-4" />}Guardar estatísticas</Button></div>
          </form>
        ) : (
          <div className="space-y-md"><div className="grid grid-cols-[1fr_auto_1fr] gap-md text-sm font-semibold text-on-surface"><span>{homeName}</span><span className="text-center text-xs text-on-surface-variant">Casa · Fora</span><span className="text-right">{awayName}</span></div>{METRICS.map(metric => { const homeValue = Number(stats?.home?.[metric.key] ?? 0); const awayValue = Number(stats?.away?.[metric.key] ?? 0); const total = homeValue + awayValue || 1; return <div key={metric.key} className="space-y-xs"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-md text-sm"><span className="font-mono tabular-nums text-on-surface">{homeValue}{metric.suffix}</span><span className="text-center text-on-surface-variant">{metric.label}</span><span className="text-right font-mono tabular-nums text-on-surface">{awayValue}{metric.suffix}</span></div><div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-surface-container-high"><span className="bg-primary" style={{ width: `${homeValue / total * 100}%` }} /><span className="bg-red-500" style={{ width: `${awayValue / total * 100}%` }} /></div></div> })}</div>
        )}
        {!canEdit && <p className="text-xs text-on-surface-variant">Visualização apenas. Não possui permissão para editar estas estatísticas.</p>}
      </div>
    </Card>
  )
}
