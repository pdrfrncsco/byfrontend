import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ExternalLink, Trash2, FileText, Upload } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Textarea,
} from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import {
  useCreatePlayerDocument,
  useDeletePlayerDocument,
  usePlayerDocuments,
} from '../hooks'
import { playerDocumentSchema, type PlayerDocumentFormData } from '../schemas'
import { MediaAssetPicker } from '@/modules/media_manager/components/MediaAssetPicker'
import type { MediaAsset } from '@/modules/media_manager/types'

const DOCUMENT_CATEGORY_VALUES = [
  'contract',
  'passport',
  'medical',
  'license',
  'certificate',
  'transfer',
  'insurance',
  'other',
] as const

interface PlayerDocumentsSectionProps {
  slug: string
  ownerId: string
}

export function PlayerDocumentsSection({ slug, ownerId }: PlayerDocumentsSectionProps) {
  const { t } = useTranslation()
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const { data: documents = [], isLoading } = usePlayerDocuments(slug)
  const createMutation = useCreatePlayerDocument(slug)
  const deleteMutation = useDeletePlayerDocument(slug)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PlayerDocumentFormData>({
    resolver: zodResolver(playerDocumentSchema),
    defaultValues: {
      title: '',
      category: 'contract',
      description: '',
      valid_from: '',
      valid_until: '',
      club: '',
      is_private: false,
      document: undefined,
    },
  })

  const watchedFile = watch('document')
  const rows = useMemo(() => (Array.isArray(documents) ? documents : []), [documents])

  const onSubmit = (data: PlayerDocumentFormData) => {
    if (!(data.document instanceof File) && !selectedAsset) return

    createMutation.mutate(
      {
        title: data.title,
        category: data.category,
        description: data.description || undefined,
        valid_from: data.valid_from || undefined,
        valid_until: data.valid_until || undefined,
        club: data.club || undefined,
        is_private: data.is_private,
        ...(data.document instanceof File ? { document: data.document } : { asset: selectedAsset?.id }),
      },
      {
        onSuccess: () => {
          reset({
            title: '',
            category: 'contract',
            description: '',
            valid_from: '',
            valid_until: '',
            club: '',
            is_private: false,
            document: undefined,
          })
          setSelectedAsset(null)
        },
      },
    )
  }

  return (
    <div className="space-y-lg">
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>{t('players.documents.section.addTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.documents.section.title')}
                htmlFor="doc-title"
                error={errors.title?.message}
                required
              >
                <Input id="doc-title" {...register('title')} state={errors.title ? 'error' : 'default'} />
              </FormField>
              <FormField
                label={t('players.documents.section.category')}
                htmlFor="doc-category"
                error={errors.category?.message}
                required
              >
                <select
                  id="doc-category"
                  {...register('category')}
                  className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {DOCUMENT_CATEGORY_VALUES.map((category) => (
                    <option key={category} value={category}>
                      {t(`players.documents.categories.${category}`)}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label={t('players.documents.section.description')}
              htmlFor="doc-description"
              error={errors.description?.message}
            >
              <Textarea id="doc-description" rows={3} {...register('description')} />
            </FormField>

            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.documents.section.validFrom')}
                htmlFor="doc-valid-from"
                error={errors.valid_from?.message}
              >
                <Input id="doc-valid-from" type="date" {...register('valid_from')} />
              </FormField>
              <FormField
                label={t('players.documents.section.validUntil')}
                htmlFor="doc-valid-until"
                error={errors.valid_until?.message}
              >
                <Input id="doc-valid-until" type="date" {...register('valid_until')} />
              </FormField>
            </div>

            <FormField
              label={t('players.documents.section.file')}
              htmlFor="doc-file"
              error={errors.document?.message}
              required
            >
              <MediaAssetPicker
                ownerType="player"
                ownerId={ownerId}
                role="document"
                accept="document"
                onSelected={(_, asset) => setSelectedAsset(asset)}
                trigger={<Button type="button" variant="outline"><Upload className="h-4 w-4" />Selecionar da Biblioteca</Button>}
              />
              <p className="text-xs text-on-surface-variant">
                {selectedAsset?.name || (watchedFile instanceof File ? watchedFile.name : 'Escolha um documento já carregado na Biblioteca de Media.')}
              </p>
            </FormField>

            <label className="inline-flex items-center gap-sm text-sm text-on-surface">
              <input type="checkbox" {...register('is_private')} className="rounded border-outline-variant" />
              {t('players.documents.section.privateLabel')}
            </label>

            <Button type="submit" loading={createMutation.isPending}>
              <Upload className="h-4 w-4" />
              {t('players.documents.section.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>{t('players.documents.section.listTitle', { count: rows.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">{t('players.documents.section.loading')}</p>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('players.documents.section.emptyTitle')}
              description={t('players.documents.section.emptyDescription')}
            />
          ) : (
            <div className="space-y-sm">
              {rows.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-md md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-xs">
                    <div className="flex flex-wrap items-center gap-sm">
                      <p className="font-semibold text-on-surface">{document.title}</p>
                      <Badge variant="outline">{document.category_label || document.category}</Badge>
                      <Badge variant="secondary">{document.status_label || document.status}</Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {document.description || t('players.common.noDescription')}
                    </p>
                    {document.asset_url && (
                      <a
                        href={document.asset_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-xs text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('players.documents.openFile')}
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error-container/20 hover:text-error"
                    loading={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('players.common.delete')}
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
