import React from 'react'
import { ShieldCheck, FileCheck, AlertCircle, Clock, Globe, UserCheck, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import type { PlayerIdentityDocument, VerificationStatus } from '../../types'

export interface PlayerIdentityCardProps {
  documents?: PlayerIdentityDocument[]
  isMinor?: boolean
  nationality?: string | null
  globalId?: string
  onUploadDocument?: () => void
  className?: string
}

const VERIFICATION_CONFIG: Record<VerificationStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  verified: { label: 'Identidade Verificada', variant: 'success' },
  pending: { label: 'Em Validação', variant: 'warning' },
  rejected: { label: 'Rejeitado / Pendente', variant: 'danger' },
}

function maskDocumentNumber(docNum: string | null | undefined): string {
  if (!docNum) return '—'
  if (docNum.length <= 4) return '****'
  const visibleStart = docNum.slice(0, 3)
  const visibleEnd = docNum.slice(-3)
  return `${visibleStart}****${visibleEnd}`
}

export function PlayerIdentityCard({
  documents = [],
  isMinor = false,
  nationality,
  globalId,
  onUploadDocument,
  className = '',
}: PlayerIdentityCardProps) {
  // Find verified doc or pending doc or most recent doc
  const primaryDoc = documents.find((d) => d.verification_status === 'verified') || documents[0]
  const status = primaryDoc?.verification_status
  const statusInfo = status ? VERIFICATION_CONFIG[status] : { label: 'Não Submetido', variant: 'secondary' as const }

  return (
    <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
        <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Identidade Civil & Registo
        </CardTitle>
        <Badge variant={statusInfo.variant} className="text-[11px]">
          {statusInfo.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-md p-lg">
        {globalId && (
          <div className="flex items-center justify-between rounded-lg bg-surface-container/40 px-3 py-2 text-xs">
            <span className="text-on-surface-variant font-medium">ID Federativo / Global:</span>
            <span className="font-mono font-bold text-on-surface">{globalId}</span>
          </div>
        )}

        <div className="space-y-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Documento Principal:</span>
            <span className="font-semibold capitalize text-on-surface">
              {primaryDoc?.document_type?.replace('_', ' ') || 'Bilhete de Identidade'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Número do Documento:</span>
            <span className="font-mono text-on-surface">
              {maskDocumentNumber(primaryDoc?.document_number)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Nacionalidade:</span>
            <span className="flex items-center gap-1 font-semibold text-on-surface">
              <Globe className="h-3 w-3 text-primary" />
              {nationality || primaryDoc?.issuing_country_label || 'Angola'}
            </span>
          </div>
        </div>

        {isMinor && (
          <div className="flex items-center gap-xs rounded-lg border border-primary/20 bg-primary/5 p-sm text-xs text-primary">
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>Atleta Menor de Idade — Requer termo de tutela / encarregado de educação.</span>
          </div>
        )}

        {onUploadDocument && (
          <div className="pt-xs">
            <Button variant="outline" size="sm" onClick={onUploadDocument} className="w-full gap-xs text-xs">
              <FileCheck className="h-3.5 w-3.5" />
              Gerir Documentos de Identidade
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
