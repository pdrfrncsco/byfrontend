import React from 'react'
import { Heart, Activity, Calendar, AlertCircle, CheckCircle2, ShieldAlert, Droplet, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import type { PlayerMedicalProfile, MedicalStatus } from '../../types'

export interface PlayerMedicalCardProps {
  medicalProfile?: PlayerMedicalProfile | null
  isLoading?: boolean
  onManageMedical?: () => void
  className?: string
}

const MEDICAL_STATUS_CONFIG: Record<MedicalStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  fit: { label: 'Apto para Competição', variant: 'success' },
  recovering: { label: 'Em Recuperação / Condicionado', variant: 'warning' },
  injured: { label: 'Lesionado', variant: 'danger' },
  suspended_medical: { label: 'Suspensão Clínica', variant: 'danger' },
}

export function PlayerMedicalCard({
  medicalProfile,
  isLoading = false,
  onManageMedical,
  className = '',
}: PlayerMedicalCardProps) {
  if (isLoading) {
    return (
      <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
        <CardContent className="p-lg">
          <div className="flex animate-pulse items-center gap-md">
            <div className="h-10 w-10 rounded-xl bg-surface-container/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-surface-container/60" />
              <div className="h-3 w-1/2 rounded bg-surface-container/40" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!medicalProfile) {
    return (
      <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
          <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
            <Heart className="h-4 w-4 text-primary" />
            Aptidão Médica
          </CardTitle>
          <Badge variant="warning" className="text-[11px]">Sem Ficha Médica</Badge>
        </CardHeader>
        <CardContent className="space-y-md p-lg">
          <p className="text-xs text-on-surface-variant">
            Nenhuma ficha clínica registada. Atletas necessitam de exame médico-desportivo anual válido para inscrição federativa.
          </p>
          {onManageMedical && (
            <Button variant="outline" size="sm" onClick={onManageMedical} className="w-full gap-xs text-xs">
              Iniciar Avaliação Médica
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const statusConfig = MEDICAL_STATUS_CONFIG[medicalProfile.medical_status] || {
    label: medicalProfile.medical_status_label || medicalProfile.medical_status,
    variant: 'secondary',
  }

  const isClearanceValid = medicalProfile.medical_clearance && medicalProfile.is_fit_to_play

  return (
    <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
        <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
          <Heart className="h-4 w-4 text-primary" />
          Aptidão Médica
        </CardTitle>
        <Badge variant={statusConfig.variant} className="text-[11px]">
          {statusConfig.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-md p-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isClearanceValid ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </span>
            )}
            <div>
              <p className="text-xs font-semibold text-on-surface">
                {isClearanceValid ? 'Certificado Médico Válido' : 'Avaliação Pendente / Expirada'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {medicalProfile.next_medical_exam
                  ? `Próxima revisão: ${new Date(medicalProfile.next_medical_exam).toLocaleDateString('pt-PT')}`
                  : 'Data de revisão não agendada'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-surface-container/50 px-2 py-1 text-xs font-semibold text-on-surface">
            <Droplet className="h-3.5 w-3.5 text-rose-500" />
            <span>{medicalProfile.blood_type || '—'}</span>
          </div>
        </div>

        {medicalProfile.needs_medical_exam && (
          <div className="flex items-center gap-xs rounded-lg border border-amber-500/20 bg-amber-500/10 p-sm text-xs text-amber-700 dark:text-amber-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Necessita de novo exame médico-desportivo federativo.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md text-xs">
          <div>
            <span className="text-on-surface-variant">Último Exame:</span>
            <p className="mt-0.5 font-medium text-on-surface">
              {medicalProfile.last_medical_exam
                ? new Date(medicalProfile.last_medical_exam).toLocaleDateString('pt-PT')
                : 'Não registado'}
            </p>
          </div>
          <div>
            <span className="text-on-surface-variant">Alergias / Restrições:</span>
            <p className="mt-0.5 truncate font-medium text-on-surface">
              {medicalProfile.allergies || 'Nenhuma declarada'}
            </p>
          </div>
        </div>

        {onManageMedical && (
          <div className="pt-xs">
            <Button variant="outline" size="sm" onClick={onManageMedical} className="w-full gap-xs text-xs">
              <Activity className="h-3.5 w-3.5" />
              Consultar Ficha Clínica
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
