import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  NativeSelect,
  Textarea,
} from '@/components/ui'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  HeartPulse,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react'
import {
  usePlayerMedicalProfile,
  usePlayerMedicalDocuments,
  useUpdateMedicalProfile,
  useUploadMedicalDocument,
  useVerifyMedicalDocument,
  useRejectMedicalDocument,
  getMedicalStatusInfo,
  getMedicalDocumentTypeLabel,
  getDocumentVerificationStatusInfo,
  formatExamDate,
  getDaysUntilExam,
  isExamOverdue,
  type MedicalProfile,
  type MedicalDocument,
} from '../../hooks/usePlayerMedical'
import type {
  MedicalStatus,
  BloodType,
  MedicalDocumentType,
  PlayerMedicalProfileUpdate,
} from '../../types'

interface PlayerMedicalSectionProps {
  playerId: string
  onViewDocument?: (document: MedicalDocument) => void
  isStaffOnly?: boolean
  readOnly?: boolean
}

export function PlayerMedicalSection({
  playerId,
  onViewDocument,
  isStaffOnly = true,
  readOnly = false,
}: PlayerMedicalSectionProps) {
  const { t } = useTranslation()
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  // Dialog states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false)

  // Queries & Mutations
  const { data: profileData, isLoading: profileLoading, error: profileError } =
    usePlayerMedicalProfile(playerId)
  const { data: docsData, isLoading: docsLoading, error: docsError } =
    usePlayerMedicalDocuments(playerId)

  const updateProfileMutation = useUpdateMedicalProfile(playerId)
  const uploadDocMutation = useUploadMedicalDocument(playerId)

  const profile = useMemo(() => (profileData as MedicalProfile | null) || null, [profileData])
  const documents = useMemo(
    () =>
      (Array.isArray(docsData)
        ? docsData
        : (docsData as { results?: MedicalDocument[] } | undefined)?.results || []) as MedicalDocument[],
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

  // Edit Profile Form State
  const [editStatus, setEditStatus] = useState<MedicalStatus>(profile?.medical_status ?? 'fit')
  const [editClearance, setEditClearance] = useState<boolean>(profile?.medical_clearance ?? false)
  const [editBloodType, setEditBloodType] = useState<BloodType>(profile?.blood_type ?? 'unknown')
  const [editFitnessStatus, setEditFitnessStatus] = useState(profile?.fitness_status ?? '')
  const [editInjuryStatus, setEditInjuryStatus] = useState(profile?.injury_status ?? '')
  const [editLastExam, setEditLastExam] = useState(profile?.last_medical_exam ?? '')
  const [editNextExam, setEditNextExam] = useState(profile?.next_medical_exam ?? '')
  const [editAllergies, setEditAllergies] = useState(profile?.allergies ?? '')
  const [editMedications, setEditMedications] = useState(profile?.current_medications ?? '')
  const [editConditions, setEditConditions] = useState(profile?.medical_conditions ?? '')
  const [editNotes, setEditNotes] = useState(profile?.medical_notes ?? '')

  // Reset Edit Form on Open
  const handleOpenEdit = () => {
    setEditStatus(profile?.medical_status ?? 'fit')
    setEditClearance(profile?.medical_clearance ?? false)
    setEditBloodType(profile?.blood_type ?? 'unknown')
    setEditFitnessStatus(profile?.fitness_status ?? '')
    setEditInjuryStatus(profile?.injury_status ?? '')
    setEditLastExam(profile?.last_medical_exam ?? '')
    setEditNextExam(profile?.next_medical_exam ?? '')
    setEditAllergies(profile?.allergies ?? '')
    setEditMedications(profile?.current_medications ?? '')
    setEditConditions(profile?.medical_conditions ?? '')
    setEditNotes(profile?.medical_notes ?? '')
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: PlayerMedicalProfileUpdate = {
      medical_status: editStatus,
      medical_clearance: editClearance,
      blood_type: editBloodType,
      fitness_status: editFitnessStatus.trim() || undefined,
      injury_status: editInjuryStatus.trim() || undefined,
      last_medical_exam: editLastExam || undefined,
      next_medical_exam: editNextExam || undefined,
      allergies: editAllergies.trim() || undefined,
      current_medications: editMedications.trim() || undefined,
      medical_conditions: editConditions.trim() || undefined,
      medical_notes: editNotes.trim() || undefined,
    }

    await updateProfileMutation.mutateAsync(payload)
    setIsEditProfileOpen(false)
  }

  // Upload Document Form State
  const [docType, setDocType] = useState<MedicalDocumentType>('medical_certificate')
  const [docTitle, setDocTitle] = useState('')
  const [docIssuedAt, setDocIssuedAt] = useState(new Date().toISOString().split('T')[0])
  const [docExpiresAt, setDocExpiresAt] = useState('')
  const [docDescription, setDocDescription] = useState('')
  const [docConfidential, setDocConfidential] = useState(true)
  const [docFile, setDocFile] = useState<File | null>(null)

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docFile || !docTitle.trim()) return

    await uploadDocMutation.mutateAsync({
      document_type: docType,
      title: docTitle.trim(),
      file: docFile,
      issued_at: docIssuedAt,
      expires_at: docExpiresAt || undefined,
      description: docDescription.trim() || undefined,
      is_confidential: docConfidential,
    })

    setDocFile(null)
    setDocTitle('')
    setDocDescription('')
    setIsUploadDocOpen(false)
  }

  const daysUntilExam = profile?.next_medical_exam ? getDaysUntilExam(profile.next_medical_exam) : null
  const examIsOverdue = profile?.next_medical_exam ? isExamOverdue(profile.next_medical_exam) : false

  // Clear, robust fitness badge logic
  const fitnessBadge = useMemo(() => {
    if (!profile) return null

    if (profile.is_fit_to_play) {
      return {
        label: '✓ Apto para Competir',
        variant: 'success' as const,
        description: 'Jogador com aptidão médica validada e sem restrições desportivas.',
        bgColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      }
    }

    if (profile.medical_status === 'fit' && !profile.medical_clearance) {
      return {
        label: '⏳ Aguarda Alta Médica / Exame',
        variant: 'warning' as const,
        description:
          'Sem lesões ativas, mas requer certificação médica oficial de aptidão desportiva.',
        bgColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      }
    }

    if (profile.medical_status === 'injured') {
      return {
        label: '✗ Não Apto — Lesionado',
        variant: 'destructive' as const,
        description: profile.injury_status || 'Em tratamento médico ou repouso clínico.',
        bgColor: 'bg-red-500/10 text-red-600 border-red-500/30',
      }
    }

    if (profile.medical_status === 'recovering') {
      return {
        label: '⏳ Em Recuperação Física',
        variant: 'secondary' as const,
        description: profile.injury_status || 'Em fase de transição e reintegração física aos treinos.',
        bgColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      }
    }

    return {
      label: '⛔ Suspenso por Motivo Médico',
      variant: 'destructive' as const,
      description: 'Afastado preventivamente por recomendação clínica.',
      bgColor: 'bg-red-500/10 text-red-600 border-red-500/30',
    }
  }, [profile])

  if (profileLoading || docsLoading) {
    return (
      <Card className="border border-outline-variant/30">
        <CardHeader>
          <CardTitle>Perfil Médico</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-xl">
          <div className="text-sm text-on-surface-variant animate-pulse">
            A carregar dados clínicos e de aptidão médica...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (profileError || docsError) {
    return (
      <Card className="border-error/30 bg-error/5">
        <CardHeader>
          <CardTitle className="text-error">Erro ao Carregar Perfil Médico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar os dados médicos do atleta. Verifique as suas permissões de acesso ou tente novamente.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-xl">
      {/* ─── Medical Clearance & Clinical Status Card ──────────────── */}
      <Card className="border border-outline-variant/30 bg-surface shadow-xs">
        <CardHeader className="border-b border-outline-variant/20 pb-md">
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-sm">
                <HeartPulse className="h-6 w-6 text-red-500" />
                <CardTitle className="text-xl font-bold">Estado de Aptidão Desportiva</CardTitle>
              </div>
              <CardDescription className="mt-1">
                {fitnessBadge ? fitnessBadge.description : 'Registo médico do atleta'}
              </CardDescription>
            </div>

            <div className="flex items-center gap-sm flex-wrap">
              {fitnessBadge && (
                <div
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${fitnessBadge.bgColor}`}
                >
                  {fitnessBadge.label}
                </div>
              )}

              {!readOnly && isStaffOnly && (
                <Button size="sm" variant="outline" onClick={handleOpenEdit} className="gap-xs text-xs">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {profile ? 'Atualizar Perfil & Aptidão' : 'Criar Perfil Médico'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-md space-y-md">
          {profile ? (
            <>
              <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-surface-container/40 p-md">
                  <p className="text-xs text-on-surface-variant font-medium">Aptidão para Competir</p>
                  <p className="mt-1 font-bold text-sm text-on-surface flex items-center gap-xs">
                    {profile.medical_clearance ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Autorizado / Com Alta
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Sem Alta Médica
                      </span>
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-surface-container/40 p-md">
                  <p className="text-xs text-on-surface-variant font-medium">Estado Clínico</p>
                  <p className="mt-1 font-bold text-sm text-on-surface capitalize">
                    {profile.medical_status_label || profile.medical_status}
                  </p>
                </div>

                <div className="rounded-xl bg-surface-container/40 p-md">
                  <p className="text-xs text-on-surface-variant font-medium">Tipo Sanguíneo</p>
                  <p className="mt-1 font-bold text-sm text-on-surface">{profile.blood_type || '—'}</p>
                </div>

                <div className="rounded-xl bg-surface-container/40 p-md">
                  <p className="text-xs text-on-surface-variant font-medium">Condição Física Geral</p>
                  <p className="mt-1 font-bold text-sm text-on-surface">
                    {profile.fitness_status || 'Em avaliação física'}
                  </p>
                </div>
              </div>

              {/* Exam Dates Grid */}
              <div className="grid gap-md sm:grid-cols-2 rounded-xl border border-outline-variant/20 p-md">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium flex items-center gap-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Último Exame Médico
                  </p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {profile.last_medical_exam ? formatExamDate(profile.last_medical_exam) : 'Sem exame registado'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-on-surface-variant font-medium flex items-center gap-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Próximo Exame Periódico
                  </p>
                  <div className="mt-1 flex items-center gap-sm">
                    <p className="text-sm font-semibold text-on-surface">
                      {profile.next_medical_exam ? formatExamDate(profile.next_medical_exam) : 'Não agendado'}
                    </p>
                    {examIsOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Atrasado
                      </Badge>
                    )}
                    {daysUntilExam !== null && !examIsOverdue && (
                      <Badge variant="secondary" className="text-xs">
                        Em {daysUntilExam} dias
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Confidential Clinical Details */}
              {isStaffOnly && (
                <div className="space-y-sm rounded-xl bg-surface-container/30 p-md text-xs">
                  <div className="flex items-center gap-xs text-on-surface font-semibold uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Dados Clínicos Confidenciais (Acesso Restrito)
                  </div>

                  <div className="grid gap-sm sm:grid-cols-3 pt-xs">
                    <div>
                      <p className="text-on-surface-variant font-medium">Alergias Conhecidas:</p>
                      <p className="mt-0.5 text-on-surface font-semibold">{profile.allergies || 'Nenhuma declarada'}</p>
                    </div>

                    <div>
                      <p className="text-on-surface-variant font-medium">Medicamentos em Uso:</p>
                      <p className="mt-0.5 text-on-surface font-semibold">{profile.current_medications || 'Nenhum declarado'}</p>
                    </div>

                    <div>
                      <p className="text-on-surface-variant font-medium">Condições Médicas:</p>
                      <p className="mt-0.5 text-on-surface font-semibold">{profile.medical_conditions || 'Nenhuma declarada'}</p>
                    </div>
                  </div>

                  {profile.injury_status && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-sm mt-sm">
                      <p className="text-red-600 font-bold text-xs">Detalhes da Lesão Ativa:</p>
                      <p className="text-on-surface mt-0.5">{profile.injury_status}</p>
                    </div>
                  )}

                  {profile.medical_notes && (
                    <div className="rounded-lg border border-outline-variant/30 bg-surface p-sm mt-sm">
                      <p className="text-on-surface-variant font-medium">Notas Confidenciais da Equipa Médica:</p>
                      <p className="text-on-surface italic mt-0.5">{profile.medical_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-lg">
              <p className="text-sm text-on-surface-variant">Nenhum perfil médico inicializado para este jogador.</p>
              {!readOnly && isStaffOnly && (
                <Button size="sm" onClick={handleOpenEdit} className="mt-sm gap-xs">
                  <Plus className="h-4 w-4" />
                  Inicializar Perfil Médico
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Medical Documents Vault ───────────────────────────────── */}
      <Card className="border border-outline-variant/30 bg-surface shadow-xs">
        <CardHeader className="border-b border-outline-variant/20 pb-md">
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-sm">
                <FileText className="h-5 w-5 text-primary" />
                Cofre de Documentos Médicos & Exames
              </CardTitle>
              <CardDescription>
                {documents.length} documento{documents.length !== 1 ? 's' : ''} registado{documents.length !== 1 ? 's' : ''} (Atestados médicos, relatórios e exames de imagem)
              </CardDescription>
            </div>

            {!readOnly && isStaffOnly && (
              <Button size="sm" onClick={() => setIsUploadDocOpen(true)} className="gap-xs text-xs">
                <Upload className="h-4 w-4" />
                Carregar Documento
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-md">
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/40 py-xl text-center">
              <FileText className="mx-auto h-8 w-8 text-on-surface-variant/40" />
              <p className="mt-2 text-sm font-medium text-on-surface">Sem documentos médicos anexados</p>
              <p className="text-xs text-on-surface-variant">
                Carregue relatórios de lesão, certificados médicos ou resultados de exames laboratoriais.
              </p>
            </div>
          ) : (
            <div className="space-y-md">
              {/* Pending */}
              {pendingDocs.length > 0 && (
                <div className="space-y-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Aguardando Validação Médica ({pendingDocs.length})
                  </p>
                  {pendingDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      playerId={playerId}
                      expanded={expandedDoc === doc.id}
                      onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      onView={() => onViewDocument?.(doc)}
                      isStaffOnly={isStaffOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}

              {/* Verified */}
              {verifiedDocs.length > 0 && (
                <div className="space-y-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Documentos Oficiais Validados ({verifiedDocs.length})
                  </p>
                  {verifiedDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      playerId={playerId}
                      expanded={expandedDoc === doc.id}
                      onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      onView={() => onViewDocument?.(doc)}
                      isStaffOnly={isStaffOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}

              {/* Rejected */}
              {rejectedDocs.length > 0 && (
                <div className="space-y-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Documentos Rejeitados / Não Conformantes ({rejectedDocs.length})
                  </p>
                  {rejectedDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      playerId={playerId}
                      expanded={expandedDoc === doc.id}
                      onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
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

      {/* ─── Modal 1: Edit Medical Profile & Clearance ─────────────── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl space-y-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-sm">
              <div className="flex items-center gap-xs">
                <HeartPulse className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-lg text-on-surface">Atualizar Perfil & Aptidão Médica</h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-md text-sm">
              <div className="grid gap-md sm:grid-cols-2">
                {/* Medical Status */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Estado Clínico do Atleta *
                  </label>
                  <NativeSelect
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as MedicalStatus)}
                    className="w-full"
                  >
                    <option value="fit">Apto (Sem lesão ativa)</option>
                    <option value="injured">Lesionado (Inapto)</option>
                    <option value="recovering">Em Recuperação Física</option>
                    <option value="suspended_medical">Suspenso por Motivo Médico</option>
                  </NativeSelect>
                </div>

                {/* Medical Clearance Switch */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Aptidão para Competir (Alta Médica) *
                  </label>
                  <NativeSelect
                    value={editClearance ? 'true' : 'false'}
                    onChange={(e) => setEditClearance(e.target.value === 'true')}
                    className="w-full font-semibold"
                  >
                    <option value="true">✓ SIM — Apto / Alta Médica Concedida</option>
                    <option value="false">✗ NÃO — Inapto / Aguarda Exame</option>
                  </NativeSelect>
                  <p className="mt-1 text-[11px] text-on-surface-variant">
                    Para o status ser "✓ Apto", é obrigatório ter o estado clínico como Apto E a alta médica concedida.
                  </p>
                </div>
              </div>

              <div className="grid gap-md sm:grid-cols-2">
                {/* Blood Type */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Tipo Sanguíneo</label>
                  <NativeSelect
                    value={editBloodType}
                    onChange={(e) => setEditBloodType(e.target.value as BloodType)}
                    className="w-full"
                  >
                    <option value="unknown">Desconhecido</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </NativeSelect>
                </div>

                {/* Fitness Status */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Condição Física Geral</label>
                  <Input
                    placeholder="Ex: 100% de capacidade aeróbica"
                    value={editFitnessStatus}
                    onChange={(e) => setEditFitnessStatus(e.target.value)}
                  />
                </div>
              </div>

              {/* Exam Dates */}
              <div className="grid gap-md sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Data do Último Exame</label>
                  <Input
                    type="date"
                    value={editLastExam}
                    onChange={(e) => setEditLastExam(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Próximo Exame Agendado</label>
                  <Input
                    type="date"
                    value={editNextExam}
                    onChange={(e) => setEditNextExam(e.target.value)}
                  />
                </div>
              </div>

              {/* Injury Details */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Descrição da Lesão (se aplicável)
                </label>
                <Textarea
                  placeholder="Ex: Entorse no tornozelo direito grau 1 durante treino em 10/09..."
                  rows={2}
                  value={editInjuryStatus}
                  onChange={(e) => setEditInjuryStatus(e.target.value)}
                />
              </div>

              {/* Confidential Clinical Fields */}
              <div className="grid gap-md sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Alergias</label>
                  <Input
                    placeholder="Ex: Penicilina"
                    value={editAllergies}
                    onChange={(e) => setEditAllergies(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Medicação em Curso</label>
                  <Input
                    placeholder="Ex: Anti-inflamatório"
                    value={editMedications}
                    onChange={(e) => setEditMedications(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Condições Prévias</label>
                  <Input
                    placeholder="Ex: Asma induzida por esforço"
                    value={editConditions}
                    onChange={(e) => setEditConditions(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Notas Confidenciais do Médico / Fisioterapeuta
                </label>
                <Textarea
                  placeholder="Observações internas restritas à equipa médica do clube..."
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-sm pt-sm border-t border-outline-variant/20">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditProfileOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'A guardar...' : 'Guardar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Upload Medical Document ──────────────────────── */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl space-y-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-sm">
              <div className="flex items-center gap-xs">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-on-surface">Carregar Documento Médico</h3>
              </div>
              <button
                onClick={() => setIsUploadDocOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-md text-sm">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Tipo de Documento *</label>
                <NativeSelect
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as MedicalDocumentType)}
                  className="w-full"
                >
                  <option value="medical_certificate">Certificado / Atestado Médico de Aptidão</option>
                  <option value="physical_exam">Exame Físico Geral</option>
                  <option value="cardiac_screening">Rastreio Cardíaco / Eletrocardiograma</option>
                  <option value="injury_report">Relatório de Lesão</option>
                  <option value="scan_result">Resultado de Exame de Imagem (RX / RM / TAC)</option>
                  <option value="lab_result">Análises Laboratoriais / Sangue</option>
                  <option value="vaccination_record">Boletim de Vacinação</option>
                  <option value="surgery_report">Relatório Cirúrgico</option>
                  <option value="other">Outro Documento Clínico</option>
                </NativeSelect>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Título do Documento *</label>
                <Input
                  placeholder="Ex: Atestado de Aptidão Desportiva 2026/27"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-md sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Data de Emissão *</label>
                  <Input
                    type="date"
                    value={docIssuedAt}
                    onChange={(e) => setDocIssuedAt(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Data de Validade</label>
                  <Input
                    type="date"
                    value={docExpiresAt}
                    onChange={(e) => setDocExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Ficheiro (PDF ou Imagem) *</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Descrição / Observações</label>
                <Textarea
                  placeholder="Notas adicionais sobre o documento..."
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-xs">
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={docConfidential}
                  onChange={(e) => setDocConfidential(e.target.checked)}
                  className="rounded border-outline text-primary focus:ring-primary"
                />
                <label htmlFor="confidentialCheck" className="text-xs text-on-surface font-medium cursor-pointer">
                  Marcar como documento confidencial (Acesso restrito ao jogador e equipa médica)
                </label>
              </div>

              <div className="flex items-center justify-end gap-sm pt-sm border-t border-outline-variant/20">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadDocOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={uploadDocMutation.isPending || !docFile || !docTitle.trim()}
                >
                  {uploadDocMutation.isPending ? 'A carregar...' : 'Enviar Documento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

interface DocumentCardProps {
  document: MedicalDocument
  playerId: string
  expanded: boolean
  onToggle: () => void
  onView?: () => void
  isStaffOnly?: boolean
  readOnly?: boolean
}

function DocumentCard({
  document,
  playerId,
  expanded,
  onToggle,
  onView,
  isStaffOnly,
  readOnly,
}: DocumentCardProps) {
  const statusInfo = getDocumentVerificationStatusInfo(document.verification_status)
  const verifyMutation = useVerifyMedicalDocument(playerId, document.id)
  const rejectMutation = useRejectMedicalDocument(playerId, document.id)

  return (
    <div
      className="rounded-xl border border-outline-variant/30 p-md hover:border-primary/40 transition-colors cursor-pointer bg-surface"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-sm flex-wrap">
            <span className="text-lg">{statusInfo.icon}</span>
            <h4 className="font-semibold text-sm text-on-surface">{document.title}</h4>
            <Badge className={`text-[10px] py-0 px-2 ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            {document.is_expired && (
              <Badge variant="destructive" className="text-[10px] py-0 px-2">
                Expirado
              </Badge>
            )}
            {document.is_confidential && (
              <Badge variant="outline" className="text-[10px] py-0 px-2 text-primary border-primary/30">
                Confidencial
              </Badge>
            )}
          </div>

          <p className="mt-1 text-xs text-on-surface-variant">
            {getMedicalDocumentTypeLabel(document.document_type)} • Emitido em {document.issued_at}
            {document.expires_at ? ` • Válido até ${document.expires_at}` : ''}
          </p>

          {expanded && (
            <div className="mt-md space-y-md border-t border-outline-variant/20 pt-md text-xs">
              {document.description && (
                <p className="text-on-surface leading-relaxed">{document.description}</p>
              )}

              <div className="grid gap-sm sm:grid-cols-2">
                <div>
                  <p className="text-on-surface-variant">Data de Emissão:</p>
                  <p className="font-medium text-on-surface">{document.issued_at}</p>
                </div>

                {document.expires_at && (
                  <div>
                    <p className="text-on-surface-variant">Data de Validade:</p>
                    <p className="font-medium text-on-surface">{document.expires_at}</p>
                  </div>
                )}

                {document.verified_by && (
                  <div>
                    <p className="text-on-surface-variant">Validado por:</p>
                    <p className="font-medium text-on-surface">{document.verified_by}</p>
                  </div>
                )}
              </div>

              {document.file_url && (
                <div className="pt-xs">
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Abrir Ficheiro Anexo
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {!readOnly && isStaffOnly && document.verification_status === 'pending' && (
          <div className="flex gap-xs shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              disabled={verifyMutation.isPending}
              onClick={() => verifyMutation.mutate()}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Validar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ reason: 'Não conforme com os regulamentos médicos' })}
            >
              <XCircle className="h-3.5 w-3.5" />
              Rejeitar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
