import { FileText, Lock, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerDocuments } from '../hooks'
import type { PlayerDocument } from '../types'

interface PlayerDocumentsTabProps {
  slug: string
  fallbackDocuments?: PlayerDocument[]
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

function statusVariant(status: PlayerDocument['status']) {
  switch (status) {
    case 'verified':
      return 'primary' as const
    case 'rejected':
      return 'danger' as const
    case 'expired':
      return 'warning' as const
    default:
      return 'outline' as const
  }
}

export function PlayerDocumentsTab({ slug, fallbackDocuments = [] }: PlayerDocumentsTabProps) {
  const { data, isLoading } = usePlayerDocuments(slug)
  const documents = data ?? fallbackDocuments

  if (isLoading && documents.length === 0) {
    return (
      <div className="space-y-sm">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Sem documentos"
        description="Este jogador ainda não publicou documentos no perfil."
      />
    )
  }

  return (
    <div className="space-y-sm">
      {documents.map((document) => (
        <Card key={document.id} variant="flat" padding="none">
          <CardContent className="flex flex-col gap-md p-lg md:flex-row md:items-center md:justify-between">
            <div className="space-y-xs">
              <div className="flex flex-wrap items-center gap-sm">
                <p className="font-semibold text-on-surface">{document.title}</p>
                <Badge variant="outline">{document.category_label || document.category}</Badge>
                <Badge variant={statusVariant(document.status)}>{document.status_label || document.status}</Badge>
                {document.is_private && (
                  <Badge variant="secondary">
                    <Lock className="mr-1 h-3 w-3" />
                    Privado
                  </Badge>
                )}
                {document.status === 'verified' && (
                  <Badge variant="primary">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-on-surface-variant">{document.description || 'Sem descrição'}</p>
              <div className="flex flex-wrap gap-md text-xs text-on-surface-variant">
                {document.club_name && <span>Clube: {document.club_name}</span>}
                <span>Válido de: {formatDate(document.valid_from)}</span>
                <span>Válido até: {formatDate(document.valid_until)}</span>
              </div>
            </div>
            {document.asset_url && (
              <Button asChild variant="secondary" size="sm">
                <a href={document.asset_url} target="_blank" rel="noreferrer">
                  Abrir ficheiro
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
