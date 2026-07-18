import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen, ExternalLink, FileText, Loader2, Plus, Trash2, X } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { useRegulations, useCreateRegulation, useDeleteRegulation } from '../hooks/useCompetitionAdvanced'
import { getCompetitionSidebarLinks } from '../constants'
import type { CompetitionRegulation, CompetitionRegulationCreateData, RegulationStatus } from '../types'

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RegulationStatus }) {
  if (status === 'published') return <Badge variant="success">Publicado</Badge>
  if (status === 'draft') return <Badge variant="warning">Rascunho</Badge>
  return <Badge variant="default">Arquivado</Badge>
}

// ─── Regulation Item ──────────────────────────────────────────────────────────

function RegulationItem({ regulation, isAdmin }: { regulation: CompetitionRegulation; isAdmin: boolean }) {
  const deleteReg = useDeleteRegulation(regulation.competition)

  return (
    <div className="flex items-start justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-colors hover:bg-surface-container-high/50">
      <div className="flex items-start gap-sm">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-sm">
            <p className="font-semibold text-on-surface">{regulation.title}</p>
            <StatusBadge status={regulation.status} />
            <span className="rounded-md bg-surface-container-high px-xs py-px text-xs text-on-surface-variant">
              v{regulation.version}
            </span>
          </div>
          {regulation.summary && (
            <p className="mt-xs text-xs text-on-surface-variant line-clamp-2">{regulation.summary}</p>
          )}
          {regulation.document && (
            <a
              href={regulation.document}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-xs inline-flex items-center gap-xs text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Ver documento
            </a>
          )}
          {regulation.published_at && (
            <p className="mt-xs text-xs text-on-surface-variant">
              Publicado: {new Date(regulation.published_at).toLocaleDateString('pt-AO')}
            </p>
          )}
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => deleteReg.mutate(regulation.id)}
          disabled={deleteReg.isPending}
          className="flex-shrink-0 rounded-lg border border-outline-variant/30 p-xs text-on-surface-variant transition-colors hover:border-red-300 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
          title="Remover regulamento"
        >
          {deleteReg.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
}

// ─── Regulation Form ──────────────────────────────────────────────────────────

function RegulationForm({ competitionId, onClose }: { competitionId: string; onClose: () => void }) {
  const createRegulation = useCreateRegulation(competitionId)
  const [form, setForm] = useState<CompetitionRegulationCreateData>({
    title: '',
    summary: '',
    version: '1.0',
    status: 'published',
  })
  const [documentUrl, setDocumentUrl] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CompetitionRegulationCreateData = {
      ...form,
      ...(documentUrl ? { document: documentUrl } : {}),
    }
    createRegulation.mutate(payload, {
      onSuccess: () => onClose(),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant/30 bg-surface-container px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-xs'

  return (
    <Card variant="flat" padding="none" className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-sm">
        <CardTitle className="flex items-center gap-sm text-sm">
          <Plus className="h-4 w-4 text-primary" />
          Novo Regulamento
        </CardTitle>
        <button
          onClick={onClose}
          className="rounded-lg p-xs text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="reg-title" className={labelClass}>Título</label>
              <input
                id="reg-title"
                name="title"
                className={inputClass}
                placeholder="Ex: Regulamento Geral da Competição 2025-26"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="reg-version" className={labelClass}>Versão</label>
              <input
                id="reg-version"
                name="version"
                className={inputClass}
                placeholder="1.0"
                value={form.version}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <div>
              <label htmlFor="reg-status" className={labelClass}>Estado</label>
              <select
                id="reg-status"
                name="status"
                className={inputClass}
                value={form.status}
                onChange={handleChange}
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div>
              <label htmlFor="reg-doc-url" className={labelClass}>URL do Documento (opcional)</label>
              <input
                id="reg-doc-url"
                name="document_url"
                type="url"
                className={inputClass}
                placeholder="https://..."
                value={documentUrl}
                onChange={e => setDocumentUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-summary" className={labelClass}>Resumo (opcional)</label>
            <textarea
              id="reg-summary"
              name="summary"
              rows={2}
              className={inputClass}
              placeholder="Breve descrição do conteúdo do regulamento"
              value={form.summary}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-sm">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={createRegulation.isPending}>
              {createRegulation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> A criar...</>
              ) : (
                'Publicar Regulamento'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── CompetitionRegulationsPage ───────────────────────────────────────────────

/**
 * CompetitionRegulationsPage — admin interface to manage competition regulations.
 * Allows creating (with version, status, document URL) and deleting regulations.
 */
export function CompetitionRegulationsPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const { isAdmin } = useCompetitionAccess()
  const [showForm, setShowForm] = useState(false)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: regulations = [], isLoading: loadingRegs } = useRegulations(competitionId)

  const published = (regulations as CompetitionRegulation[]).filter(r => r.status === 'published')
  const drafts = (regulations as CompetitionRegulation[]).filter(r => r.status === 'draft')
  const archived = (regulations as CompetitionRegulation[]).filter(r => r.status === 'archived')

  return (
    <DashboardLayout
      title="Regulamentos"
      subtitle={
        !loadingComp && competition
          ? `${competition.name} — ${competition.season}`
          : 'Gerir regulamentos da competição.'
      }
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        isAdmin ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(v => !v)}
            id="new-regulation-btn"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Regulamento</span>
          </Button>
        ) : undefined
      }
    >
      {/* Form */}
      {isAdmin && showForm && (
        <div className="mb-lg">
          <RegulationForm competitionId={competitionId} onClose={() => setShowForm(false)} />
        </div>
      )}

      {loadingRegs ? (
        <div className="flex items-center gap-sm py-xl text-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" />
          A carregar regulamentos...
        </div>
      ) : regulations.length === 0 ? (
        <Card variant="flat" padding="lg">
          <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
            <BookOpen className="h-10 w-10 opacity-30" />
            <p className="font-medium">Nenhum regulamento publicado.</p>
            <p className="text-sm opacity-70">Adicione os regulamentos desta competição.</p>
            {isAdmin && (
              <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Adicionar Regulamento
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-lg">
          {published.length > 0 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm text-sm">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">Publicados</span>
                  <Badge variant="success">{published.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm">
                {published.map(r => (
                  <RegulationItem key={r.id} regulation={r} isAdmin={isAdmin} />
                ))}
              </CardContent>
            </Card>
          )}

          {drafts.length > 0 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm text-sm">
                  <span className="text-amber-600">Rascunhos</span>
                  <Badge variant="warning">{drafts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm">
                {drafts.map(r => (
                  <RegulationItem key={r.id} regulation={r} isAdmin={isAdmin} />
                ))}
              </CardContent>
            </Card>
          )}

          {archived.length > 0 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm text-sm text-on-surface-variant">
                  Arquivados
                  <span className="rounded-full bg-surface-container-high px-sm text-xs">{archived.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm">
                {archived.map(r => (
                  <RegulationItem key={r.id} regulation={r} isAdmin={isAdmin} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
