import { useTranslation } from 'react-i18next'
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

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale)
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
  const { t, i18n } = useTranslation()
  const { data, isLoading } = usePlayerDocuments(slug)
  const documents = data ?? fallbackDocuments
  const locale = i18n.language || 'pt-AO'

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
        title={t('players.documents.emptyTitle')}
        description={t('players.documents.emptyDescription')}
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
                    {t('players.common.private')}
                  </Badge>
                )}
                {document.status === 'verified' && (
                  <Badge variant="primary">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    {t('players.common.verified')}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-on-surface-variant">
                {document.description || t('players.common.noDescription')}
              </p>
              <div className="flex flex-wrap gap-md text-xs text-on-surface-variant">
                {document.club_name && (
                  <span>
                    {t('players.documents.clubLabel')}: {document.club_name}
                  </span>
                )}
                <span>
                  {t('players.documents.validFrom')}: {formatDate(document.valid_from, locale)}
                </span>
                <span>
                  {t('players.documents.validUntil')}: {formatDate(document.valid_until, locale)}
                </span>
              </div>
            </div>
            {document.asset_url && (
              <Button asChild variant="secondary" size="sm">
                <a href={document.asset_url} target="_blank" rel="noreferrer">
                  {t('players.documents.openFile')}
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
