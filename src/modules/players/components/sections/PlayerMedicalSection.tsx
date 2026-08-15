import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar, FileText, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import {
  usePlayerMedicalProfile,
  usePlayerMedicalDocuments,
  getMedicalStatusInfo,
  getMedicalDocumentTypeLabel,
  getDocumentVerificationStatusInfo,
  formatExamDate,
  getDaysUntilExam,
  isExamOverdue,
  type MedicalProfile,
  type MedicalDocument,
} from '../../hooks/usePlayerMedical'

interface PlayerMedicalSectionProps {
  playerId: string
  onAddMedicalInfo?: () => void
  onUploadDocument?: () => void
  onViewDocument?: (document: MedicalDocument) => void
  onVerifyDocument?: (documentId: string) => Promise<void>
  onRejectDocument?: (documentId: string) => Promise<void>
  isStaffOnly?: boolean
  readOnly?: boolean
}

export function PlayerMedicalSection({
  playerId,
  onAddMedicalInfo,
  onUploadDocument,
  onViewDocument,
  onVerifyDocument,
  onRejectDocument,
  isStaffOnly = true,
  readOnly = false,
}: PlayerMedicalSectionProps) {
  const { t } = useTranslation()
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const { data: profileData, isLoading: profileLoading, error: profileError } =
    usePlayerMedicalProfile(playerId)
  const { data: docsData, isLoading: docsLoading, error: docsError } =
    usePlayerMedicalDocuments(playerId)

  const profile = useMemo(() => (profileData as MedicalProfile | null) || null, [profileData])
  const documents = useMemo(
    () => ((docsData?.results || []) as MedicalDocument[]) || [],
    [docsData]
  )

  const pendingDocs = useMemo(
    () => documents.filter((d) => d.verification_status === 'pending'),
    [documents]
  )
  const verifiedDocs = useMemo(
    () => documents.filter((d) => d.verification_status === 'verified'),
    [documents]
  )
  const rejectedDocs = useMemo(
    () => documents.filter((d) => d.verification_status === 'rejected'),
    [documents]
  )

  const statusInfo = profile ? getMedicalStatusInfo(profile.medical_status) : null
  const daysUntilExam = profile?.next_medical_exam ? getDaysUntilExam(profile.next_medical_exam) : null
  const examIsOverdue = profile?.next_medical_exam ? isExamOverdue(profile.next_medical_exam) : false

  if (profileLoading || docsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil Médico</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-lg">
          <div className="text-sm text-on-surface-variant">Carregando perfil médico...</div>
        </CardContent>
      </Card>
    )
  }

  if (profileError || docsError) {
    return (
      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error">Erro ao Carregar Perfil Médico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar os dados médicos. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!profile && isStaffOnly) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Perfil Médico</CardTitle>
              <CardDescription>Nenhum perfil médico registado</CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={onAddMedicalInfo} size="sm">
                <Plus className="h-4 w-4" />
                Criar Perfil
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Medical Status Alert */}
      {profile && statusInfo && (
        <Card
          className={`border-l-4 ${statusInfo.color.replace('text-', 'border-')} ${statusInfo.bgColor.replace('text-', 'bg-').replace('-100', '-50')}`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-md">
                  <span className="text-2xl">{statusInfo.icon}</span>
                  {statusInfo.label}
                </CardTitle>
                <CardDescription>
                  {profile.medical_clearance ? 'Apto para competir' : 'Não apto para competir'}
                </CardDescription>
              </div>
              <Badge
                className={`${statusInfo.bgColor} ${statusInfo.color}`}
                variant="secondary"
              >
                {profile.is_fit_to_play ? '✓ Apto' : '✗ Não Apto'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-md">
            <div className="grid gap-md sm:grid-cols-2">
              <div>
                <p className="text-xs text-on-surface-variant">Tipo Sanguíneo</p>
                <p className="text-sm font-semibold text-on-surface">{profile.blood_type}</p>
              </div>

              {profile.fitness_status && (
                <div>
                  <p className="text-xs text-on-surface-variant">Estado Físico</p>
                  <p className="text-sm font-semibold text-on-surface">{profile.fitness_status}</p>
                </div>
              )}

              {profile.last_medical_exam && (
                <div>
                  <p className="text-xs text-on-surface-variant">Último Exame</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {formatExamDate(profile.last_medical_exam)}
                  </p>
                </div>
              )}

              {profile.next_medical_exam && (
                <div>
                  <p className="text-xs text-on-surface-variant">Próximo Exame</p>
                  <div className="flex items-center gap-sm">
                    <p className="text-sm font-semibold text-on-surface">
                      {formatExamDate(profile.next_medical_exam)}
                    </p>
                    {examIsOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Atrasado
                      </Badge>
                    )}
                    {daysUntilExam !== null && !examIsOverdue && (
                      <Badge variant="secondary" className="text-xs">
                        {daysUntilExam} dias
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Medical Info */}
            {isStaffOnly && (
              <div className="space-y-md rounded bg-surface/50 p-md">
                <div>
                  <p className="text-xs text-on-surface-variant">Alergias</p>
                  <p className="text-sm text-on-surface">{profile.allergies || '—'}</p>
                </div>

                <div>
                  <p className="text-xs text-on-surface-variant">Medicamentos Atuais</p>
                  <p className="text-sm text-on-surface">{profile.current_medications || '—'}</p>
                </div>

                {profile.medical_conditions && (
                  <div>
                    <p className="text-xs text-on-surface-variant">Condições Médicas</p>
                    <p className="text-sm text-on-surface">{profile.medical_conditions}</p>
                  </div>
                )}

                {profile.injury_status && (
                  <div>
                    <p className="text-xs text-on-surface-variant">Estado da Lesão</p>
                    <p className="text-sm text-on-surface">{profile.injury_status}</p>
                  </div>
                )}

                {profile.medical_notes && (
                  <div>
                    <p className="text-xs text-on-surface-variant">Notas Médicas (Confidencial)</p>
                    <p className="text-sm text-on-surface italic">{profile.medical_notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medical Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documentos Médicos</CardTitle>
              <CardDescription>
                {documents.length} documento{documents.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={onUploadDocument} size="sm">
                <Plus className="h-4 w-4" />
                Upload
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline p-lg text-center">
              <FileText className="mx-auto h-8 w-8 text-on-surface-variant/50" />
              <p className="mt-md text-sm text-on-surface-variant">
                Sem documentos médicos registados
              </p>
            </div>
          ) : (
            <div className="space-y-md">
              {/* Pending Documents */}
              {pendingDocs.length > 0 && (
                <div className="space-y-sm">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant">
                    Pendentes ({pendingDocs.length})
                  </p>
                  {pendingDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      expanded={expandedDoc === doc.id}
                      onToggle={() =>
                        setExpandedDoc(expandedDoc === doc.id ? null : doc.id)
                      }
                      onView={() => onViewDocument?.(doc)}
                      onVerify={() => onVerifyDocument?.(doc.id)}
                      onReject={() => onRejectDocument?.(doc.id)}
                      isStaffOnly={isStaffOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}

              {/* Verified Documents */}
              {verifiedDocs.length > 0 && (
                <div className="space-y-sm">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant">
                    Verificados ({verifiedDocs.length})
                  </p>
                  {verifiedDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      expanded={expandedDoc === doc.id}
                      onToggle={() =>
                        setExpandedDoc(expandedDoc === doc.id ? null : doc.id)
                      }
                      onView={() => onViewDocument?.(doc)}
                      isStaffOnly={isStaffOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}

              {/* Rejected Documents */}
              {rejectedDocs.length > 0 && (
                <div className="space-y-sm">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant">
                    Rejeitados ({rejectedDocs.length})
                  </p>
                  {rejectedDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      expanded={expandedDoc === doc.id}
                      onToggle={() =>
                        setExpandedDoc(expandedDoc === doc.id ? null : doc.id)
                      }
                      onView={() => onViewDocument?.(doc)}
                      isStaffOnly={isStaffOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Overdue Alert */}
      {examIsOverdue && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-md">
          <div className="flex gap-md">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-700" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Exame Médico Atrasado</p>
              <p className="mt-sm">
                O jogador está com o exame médico em atraso. Um novo exame deve ser agendado com urgência.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DocumentCardProps {
  document: MedicalDocument
  expanded: boolean
  onToggle: () => void
  onView?: () => void
  onVerify?: () => Promise<void>
  onReject?: () => Promise<void>
  isStaffOnly?: boolean
  readOnly?: boolean
}

function DocumentCard({
  document,
  expanded,
  onToggle,
  onView,
  onVerify,
  onReject,
  isStaffOnly,
  readOnly,
}: DocumentCardProps) {
  const statusInfo = getDocumentVerificationStatusInfo(document.verification_status)

  return (
    <div
      className="rounded-lg border border-outline/50 p-md hover:border-outline transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-sm flex-wrap">
            <span className="text-lg">{statusInfo.icon}</span>
            <h4 className="font-semibold text-on-surface">{document.title}</h4>
            <Badge className={`text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            {document.is_expired && (
              <Badge variant="destructive" className="text-xs">
                Expirado
              </Badge>
            )}
          </div>

          <p className="mt-sm text-xs text-on-surface-variant">
            {getMedicalDocumentTypeLabel(document.document_type)} • {document.issued_at}
          </p>

          {expanded && (
            <div className="mt-md space-y-md border-t border-outline/30 pt-md">
              {document.description && (
                <p className="text-sm text-on-surface">{document.description}</p>
              )}

              <div className="grid gap-sm text-xs sm:grid-cols-2">
                <div>
                  <p className="text-on-surface-variant">Emitido</p>
                  <p className="font-medium text-on-surface">{document.issued_at}</p>
                </div>

                {document.expires_at && (
                  <div>
                    <p className="text-on-surface-variant">Válido até</p>
                    <p className="font-medium text-on-surface">{document.expires_at}</p>
                  </div>
                )}

                {document.verified_by && (
                  <div>
                    <p className="text-on-surface-variant">Verificado por</p>
                    <p className="font-medium text-on-surface">{document.verified_by}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!readOnly && isStaffOnly && document.verification_status === 'pending' && (
          <div className="flex gap-sm flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onVerify?.()
              }}
              className="p-sm text-green-700 hover:bg-green-50 rounded"
              title="Verificar"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReject?.()
              }}
              className="p-sm text-red-700 hover:bg-red-50 rounded"
              title="Rejeitar"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
