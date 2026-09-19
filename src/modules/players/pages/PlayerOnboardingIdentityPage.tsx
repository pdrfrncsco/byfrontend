import { useState, useMemo, useRef, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileText,
  Info,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  NativeSelect,
} from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import {
  useCompleteOnboardingStep,
  useCreateIdentityDocument,
  useDeleteIdentityDocument,
  usePlayerIdentityDocuments,
  usePlayerMe,
  usePlayerWizard,
} from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'
import type { IdentityDocumentType } from '../types'

const DOCUMENT_TYPES: { value: IdentityDocumentType; label: string }[] = [
  { value: 'national_id', label: 'Bilhete de Identidade (B.I.)' },
  { value: 'passport', label: 'Passaporte Internacional' },
  { value: 'birth_certificate', label: 'Cédula / Certidão de Nascimento' },
  { value: 'residence_permit', label: 'Título de Residência' },
  { value: 'other', label: 'Outro Documento Oficial' },
]

export function PlayerOnboardingIdentityPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const completeStep = useCompleteOnboardingStep()
  const { markStepCompleted } = usePlayerWizard()
  const { data: player, isLoading: playerLoading } = usePlayerMe()

  const playerSlug = player?.slug ?? ''
  const { data: documents = [], isLoading: docsLoading } = usePlayerIdentityDocuments(playerSlug)
  const createDocument = useCreateIdentityDocument(playerSlug)
  const deleteDocument = useDeleteIdentityDocument(playerSlug)

  // Form states
  const [documentType, setDocumentType] = useState<IdentityDocumentType>('national_id')
  const [documentNumber, setDocumentNumber] = useState('')
  const [issuingCountry, setIssuingCountry] = useState('Angola')
  const [issuingAuthority, setIssuingAuthority] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const hasExistingDocs = documents.length > 0
  const isSubmitting = createDocument.isPending || completeStep.isPending

  const handleFrontChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFrontFile(e.target.files[0])
      setFormError(null)
    }
  }

  const handleBackChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBackFile(e.target.files[0])
    }
  }

  const handleSaveAndContinue = async () => {
    setFormError(null)

    // Se preencheu algum campo ou já tem ficheiro selecionado, valida e faz upload
    if (frontFile || documentNumber.trim()) {
      if (!documentNumber.trim()) {
        setFormError('Por favor insira o número do documento de identificação.')
        return
      }
      if (!frontFile && !hasExistingDocs) {
        setFormError('Por favor anexe o ficheiro ou foto frontal do documento.')
        return
      }

      if (frontFile && playerSlug) {
        try {
          await createDocument.mutateAsync({
            document_type: documentType,
            document_number: documentNumber.trim(),
            issuing_country: issuingCountry.trim() || undefined,
            issuing_authority: issuingAuthority.trim() || undefined,
            issue_date: issueDate || undefined,
            expiry_date: expiryDate || undefined,
            document_front: frontFile,
            document_back: backFile || undefined,
          })
        } catch (err: unknown) {
          setFormError('Ocorreu um erro ao carregar o documento. Tente novamente.')
          return
        }
      }
    }

    markStepCompleted('identity')
    await completeStep.mutateAsync('identity')
    navigate(ROUTES.ONBOARDING_PLAYER_GUARDIAN)
  }

  const handleSkip = async () => {
    markStepCompleted('identity')
    await completeStep.mutateAsync('identity')
    navigate(ROUTES.ONBOARDING_PLAYER_GUARDIAN)
  }

  return (
    <PlayerOnboardingLayout
      step={5}
      isSaving={isSubmitting}
      onNext={handleSaveAndContinue}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_CONTACT)}
    >
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Documento de Identificação</h2>
              <p className="text-sm text-on-surface-variant">
                Registo oficial para validação federativa e inscrição em competições.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="self-start text-xs sm:self-auto">
            Opcional no registo
          </Badge>
        </div>

        {/* Existing uploaded documents */}
        {documents.length > 0 && (
          <Card variant="flat" padding="none" className="border border-outline-variant/30 bg-surface-container/50">
            <CardHeader className="p-md pb-xs">
              <CardTitle className="text-sm font-semibold flex items-center gap-xs">
                <FileCheck className="h-4 w-4 text-success" />
                Documentos já carregados ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-md pt-0 space-y-xs">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface p-sm text-sm"
                >
                  <div className="flex items-center gap-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-semibold text-on-surface">
                        {DOCUMENT_TYPES.find((d) => d.value === doc.document_type)?.label ?? doc.document_type}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Nº {doc.document_number || 'Não informado'} • {doc.issuing_country_label || doc.issuing_country || 'Angola'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <Badge
                      variant={doc.verification_status === 'verified' ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {doc.verification_status === 'verified' ? 'Verificado' : 'Pendente de Verificação'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger hover:bg-danger/10"
                      onClick={() => deleteDocument.mutate(doc.id)}
                      disabled={deleteDocument.isPending}
                      aria-label="Remover documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Form to add identity document */}
        <Card variant="flat" className="border-outline-variant/30 bg-surface-container/40">
          <CardContent className="space-y-md p-md md:p-lg">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-sm">
              <h3 className="font-semibold text-sm text-on-surface flex items-center gap-xs">
                <FileText className="h-4 w-4 text-primary" />
                {hasExistingDocs ? 'Adicionar outro documento' : 'Dados do Documento'}
              </h3>
            </div>

            {formError && (
              <div className="flex items-center gap-sm rounded-lg border border-danger/30 bg-danger/10 p-sm text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid gap-md sm:grid-cols-2">
              <FormField label="Tipo de Documento" required>
                <NativeSelect
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as IdentityDocumentType)}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>

              <FormField label="Número do Documento">
                <Input
                  placeholder="Ex: 004829182LA041"
                  value={documentNumber}
                  onChange={(e) => {
                    setDocumentNumber(e.target.value)
                    setFormError(null)
                  }}
                />
              </FormField>

              <FormField label="País Emissor">
                <Input
                  placeholder="Ex: Angola"
                  value={issuingCountry}
                  onChange={(e) => setIssuingCountry(e.target.value)}
                />
              </FormField>

              <FormField label="Autoridade Emissora (Opcional)">
                <Input
                  placeholder="Ex: Direcção Nacional de Identificação Civil"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                />
              </FormField>

              <FormField label="Data de Emissão">
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </FormField>

              <FormField label="Data de Validade">
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </FormField>
            </div>

            {/* File Uploads */}
            <div className="grid gap-md sm:grid-cols-2 pt-xs">
              {/* Front File */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Frente do Documento (Foto ou PDF)</span>
                  {frontFile && <span className="text-primary font-normal text-xs">{frontFile.name}</span>}
                </label>
                <input
                  type="file"
                  ref={frontInputRef}
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFrontChange}
                />
                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface p-md text-center transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <Upload className="h-6 w-6 text-on-surface-variant mb-1" />
                  <span className="text-xs font-medium text-on-surface">
                    {frontFile ? 'Alterar ficheiro da frente' : 'Clique para carregar frente'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">PNG, JPG ou PDF (máx. 10MB)</span>
                </button>
              </div>

              {/* Back File */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Verso do Documento (Opcional)</span>
                  {backFile && <span className="text-primary font-normal text-xs">{backFile.name}</span>}
                </label>
                <input
                  type="file"
                  ref={backInputRef}
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleBackChange}
                />
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface p-md text-center transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <Upload className="h-6 w-6 text-on-surface-variant mb-1" />
                  <span className="text-xs font-medium text-on-surface">
                    {backFile ? 'Alterar ficheiro do verso' : 'Clique para carregar verso'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">PNG, JPG ou PDF (máx. 10MB)</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Callout */}
        <div className="flex items-start gap-md rounded-xl border border-primary/20 bg-primary/5 p-md text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-semibold text-on-surface">Não tem o documento consigo agora?</p>
            <p className="text-xs text-on-surface-variant">
              A verificação de identidade é mandatória para inscrição em competições oficiais ou transferências federadas, mas pode ser completada posteriormente através do painel de configurações do jogador.
            </p>
          </div>
        </div>

        {/* Skip Action Button */}
        <div className="flex justify-end pt-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-on-surface-variant hover:text-on-surface"
          >
            Preencher documento mais tarde →
          </Button>
        </div>
      </div>
    </PlayerOnboardingLayout>
  )
}
