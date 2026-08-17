import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  FormFieldSimple,
  Input,
} from '@/components/ui'
import {
  useCreateIdentityDocument,
  useDeleteIdentityDocument,
  usePlayerIdentityDocuments,
} from '../hooks'
import { playerIdentityDocumentSchema, type PlayerIdentityDocumentFormData } from '../schemas/identity.schema'

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'Bilhete de identidade' },
  { value: 'passport', label: 'Passaporte' },
  { value: 'birth_certificate', label: 'Certidão de nascimento' },
  { value: 'residence_permit', label: 'Título de residência' },
  { value: 'other', label: 'Outro' },
] as const

function getDocumentTypeLabel(value: string) {
  return DOCUMENT_TYPES.find((option) => option.value === value)?.label ?? value
}

export function PlayerIdentityDocumentsSection({ slug }: { slug: string }) {
  const fileFrontRef = useRef<HTMLInputElement>(null)
  const fileBackRef = useRef<HTMLInputElement>(null)
  const { data: documents = [], isLoading } = usePlayerIdentityDocuments(slug)
  const create = useCreateIdentityDocument(slug)
  const remove = useDeleteIdentityDocument(slug)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlayerIdentityDocumentFormData>({
    resolver: zodResolver(playerIdentityDocumentSchema),
    defaultValues: {
      document_type: 'national_id',
      document_number: '',
      issuing_country: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
    },
  })

  const frontFile = watch('document_front')
  const backFile = watch('document_back')

  useEffect(() => {
    if (!create.isSuccess) return
    reset({
      document_type: 'national_id',
      document_number: '',
      issuing_country: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      document_front: undefined,
      document_back: undefined,
    })
    if (fileFrontRef.current) fileFrontRef.current.value = ''
    if (fileBackRef.current) fileBackRef.current.value = ''
  }, [create.isSuccess, reset])

  const rows = useMemo(() => (Array.isArray(documents) ? documents : []), [documents])

  const onSubmit = async (values: PlayerIdentityDocumentFormData) => {
    await create.mutateAsync({
      document_type: values.document_type,
      document_number: values.document_number?.trim() || undefined,
      issuing_country: values.issuing_country?.trim() || undefined,
      issuing_authority: values.issuing_authority?.trim() || undefined,
      issue_date: values.issue_date || undefined,
      expiry_date: values.expiry_date || undefined,
      document_front: values.document_front,
      document_back: values.document_back,
    })
  }

  return (
    <div className="space-y-lg">
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Adicionar identidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-md rounded-lg border border-primary/20 bg-primary-container/10 p-md text-sm text-on-surface-variant">
            O documento de identidade é opcional no onboarding. Pode ser registado aqui no dashboard a qualquer momento.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
            <div className="grid gap-md md:grid-cols-2">
              <FormFieldSimple label="Tipo de documento" htmlFor="identity-document-type" error={errors.document_type?.message} required>
                <select
                  id="identity-document-type"
                  {...register('document_type')}
                  className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {DOCUMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormFieldSimple>

              <FormFieldSimple label="Número do documento" htmlFor="identity-document-number" error={errors.document_number?.message}>
                <Input id="identity-document-number" {...register('document_number')} />
              </FormFieldSimple>
            </div>

            <div className="grid gap-md md:grid-cols-2">
              <FormFieldSimple label="País emissor" htmlFor="identity-issuing-country" error={errors.issuing_country?.message}>
                <Input id="identity-issuing-country" maxLength={3} {...register('issuing_country')} />
              </FormFieldSimple>

              <FormFieldSimple label="Autoridade emissora" htmlFor="identity-issuing-authority" error={errors.issuing_authority?.message}>
                <Input id="identity-issuing-authority" {...register('issuing_authority')} />
              </FormFieldSimple>
            </div>

            <div className="grid gap-md md:grid-cols-2">
              <FormFieldSimple label="Data de emissão" htmlFor="identity-issue-date" error={errors.issue_date?.message}>
                <Input id="identity-issue-date" type="date" {...register('issue_date')} />
              </FormFieldSimple>

              <FormFieldSimple label="Data de validade" htmlFor="identity-expiry-date" error={errors.expiry_date?.message}>
                <Input id="identity-expiry-date" type="date" {...register('expiry_date')} />
              </FormFieldSimple>
            </div>

            <FormFieldSimple label="Frente do documento" htmlFor="identity-document-front" error={errors.document_front?.message} required>
              <Input
                ref={fileFrontRef}
                id="identity-document-front"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  setValue('document_front', file, { shouldValidate: true, shouldDirty: true })
                }}
              />
              <p className="mt-xs text-xs text-on-surface-variant">
                {frontFile instanceof File ? frontFile.name : 'Selecione a frente do documento'}
              </p>
            </FormFieldSimple>

            <FormFieldSimple label="Verso do documento" htmlFor="identity-document-back" error={errors.document_back?.message}>
              <Input
                ref={fileBackRef}
                id="identity-document-back"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  setValue('document_back', file, { shouldValidate: true, shouldDirty: true })
                }}
              />
              <p className="mt-xs text-xs text-on-surface-variant">
                {backFile instanceof File ? backFile.name : 'Opcional'}
              </p>
            </FormFieldSimple>

            {create.isError && (
              <div className="rounded-lg bg-error/10 border border-error/30 p-md text-sm text-error">
                Não foi possível guardar a identidade. Verifique os dados e tente novamente.
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={create.isPending}>
                <Upload className="h-4 w-4" />
                Guardar identidade
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Documentos guardados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">A carregar documentos...</p>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Ainda não há identidade guardada"
              description="Use o formulário acima para anexar a frente e o verso do documento."
            />
          ) : (
            <div className="space-y-sm">
              {rows.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-md md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-xs">
                    <div className="flex flex-wrap items-center gap-sm">
                      <p className="font-semibold text-on-surface">{getDocumentTypeLabel(document.document_type)}</p>
                      <Badge variant="outline">{document.verification_status}</Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {document.document_number || 'Sem número informado'}
                    </p>
                    <div className="flex flex-wrap gap-sm text-sm">
                      {document.document_front_url && (
                        <a
                          href={document.document_front_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Frente
                        </a>
                      )}
                      {document.document_back_url && (
                        <a
                          href={document.document_back_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Verso
                        </a>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error-container/20 hover:text-error"
                    loading={remove.isPending}
                    onClick={() => remove.mutate(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
