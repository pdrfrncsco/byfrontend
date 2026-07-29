import { useState } from 'react'
import { Check, CheckCircle2, FileText, Loader2, Lock, Upload } from 'lucide-react'
import { Button, Card, Textarea } from '@/components/ui'
import type { Match } from '../types'

interface RefereeReportForm {
  home_score: number
  away_score: number
  match_duration: number
  incidents: string
  notes: string
}

export interface MatchRefereeReportProps {
  match: Match
  report: any | null
  canSubmit: boolean
  canApprove: boolean
  isSubmitting: boolean
  isApproving: boolean
  onSubmit: (data: RefereeReportForm) => Promise<void>
  onApprove: () => Promise<void>
  onUpload: (file: File) => Promise<string>
}

const WORKFLOW = [
  { key: 'draft', label: 'Rascunho' },
  { key: 'submitted', label: 'Submetido' },
  { key: 'approved', label: 'Aprovado' },
]

function getWorkflowIndex(status?: string) {
  if (status === 'validated' || status === 'approved' || status === 'finalized') return 2
  if (status === 'completed' || status === 'submitted' || status === 'ongoing') return 1
  return 0
}

export function MatchRefereeReport({
  match,
  report,
  canSubmit,
  canApprove,
  isSubmitting,
  isApproving,
  onSubmit,
  onApprove,
  onUpload,
}: MatchRefereeReportProps) {
  const [form, setForm] = useState<RefereeReportForm>({
    home_score: report?.home_score ?? match.home_score ?? 0,
    away_score: report?.away_score ?? match.away_score ?? 0,
    match_duration: report?.match_duration ?? 90,
    incidents: report?.incidents ?? '',
    notes: report?.notes ?? '',
  })
  const [signatureConfirmed, setSignatureConfirmed] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string>(report?.document_url ?? '')
  const [error, setError] = useState('')
  const workflowIndex = getWorkflowIndex(report?.status)
  const isLocked = workflowIndex >= 2

  const update = <K extends keyof RefereeReportForm>(field: K, value: RefereeReportForm[K]) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signatureConfirmed) {
      setError('Confirme a assinatura digital antes de submeter o relatório.')
      return
    }
    setError('')
    await onSubmit(form)
  }

  const upload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Apenas documentos PDF são aceites.')
      return
    }
    setError('')
    setIsUploading(true)
    try {
      setDocumentUrl(await onUpload(file))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card variant="flat" padding="lg">
      <div className="space-y-lg">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div>
            <h2 className="flex items-center gap-sm text-lg font-semibold text-on-surface">
              <FileText className="h-5 w-5" /> Relatório do árbitro
            </h2>
            <p className="mt-xs text-sm text-on-surface-variant">Workflow oficial da partida</p>
          </div>
          <div className="flex items-center gap-xs" aria-label="Estado do relatório">
            {WORKFLOW.map((step, index) => (
              <div key={step.key} className="flex items-center gap-xs">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index <= workflowIndex ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {index < workflowIndex ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                {index < WORKFLOW.length - 1 && <span className="h-px w-4 bg-outline-variant/40" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-sm text-xs text-on-surface-variant sm:grid-cols-3">
          {WORKFLOW.map((step, index) => (
            <span key={step.key} className={index === workflowIndex ? 'font-semibold text-primary' : ''}>{step.label}</span>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-md">
          <div className="grid gap-md sm:grid-cols-3">
            <label className="space-y-xs text-sm font-medium text-on-surface-variant">
              Resultado casa
              <input type="number" min="0" value={form.home_score} disabled={isLocked} onChange={event => update('home_score', Number(event.target.value))} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface" />
            </label>
            <label className="space-y-xs text-sm font-medium text-on-surface-variant">
              Resultado fora
              <input type="number" min="0" value={form.away_score} disabled={isLocked} onChange={event => update('away_score', Number(event.target.value))} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface" />
            </label>
            <label className="space-y-xs text-sm font-medium text-on-surface-variant">
              Duração (minutos)
              <input type="number" min="1" max="180" value={form.match_duration} disabled={isLocked} onChange={event => update('match_duration', Number(event.target.value))} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface" />
            </label>
          </div>

          <label className="block space-y-xs text-sm font-medium text-on-surface-variant">
            Incidentes disciplinares
            <Textarea value={form.incidents} disabled={isLocked} onChange={event => update('incidents', event.target.value)} placeholder="Descreva incidentes relevantes..." rows={4} />
          </label>
          <label className="block space-y-xs text-sm font-medium text-on-surface-variant">
            Observações
            <Textarea value={form.notes} disabled={isLocked} onChange={event => update('notes', event.target.value)} placeholder="Condições do campo, assistência ou outras observações..." rows={3} />
          </label>

          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-md">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div>
                <p className="text-sm font-medium text-on-surface">Documento oficial (PDF)</p>
                {documentUrl ? <a href={documentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Ver documento carregado</a> : <p className="text-xs text-on-surface-variant">Nenhum documento carregado</p>}
              </div>
              {canSubmit && !isLocked && (
                <label className="inline-flex cursor-pointer items-center gap-xs rounded-lg border border-outline-variant/30 px-md py-sm text-sm font-medium text-on-surface hover:bg-surface-container-high">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Carregar PDF
                  <input type="file" accept="application/pdf" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file) }} disabled={isUploading} />
                </label>
              )}
            </div>
          </div>

          {canSubmit && !isLocked && (
            <label className="flex items-start gap-sm text-sm text-on-surface-variant">
              <input type="checkbox" checked={signatureConfirmed} onChange={event => setSignatureConfirmed(event.target.checked)} className="mt-0.5 rounded border-outline-variant" />
              <span>Confirmo que as informações deste relatório são verdadeiras e assumo a responsabilidade pela assinatura digital.</span>
            </label>
          )}

          {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}

          <div className="flex flex-wrap justify-end gap-sm">
            {canSubmit && !isLocked && <Button type="submit" variant="primary" disabled={isSubmitting || !signatureConfirmed}>{isSubmitting ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-xs h-4 w-4" />}Submeter relatório</Button>}
            {canApprove && workflowIndex === 1 && <Button type="button" variant="secondary" onClick={() => void onApprove()} disabled={isApproving}>{isApproving ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Lock className="mr-xs h-4 w-4" />}Aprovar relatório</Button>}
          </div>
        </form>
      </div>
    </Card>
  )
}
