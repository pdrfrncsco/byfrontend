import { useMemo, useRef } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Globe, Lock, Trash2, Upload } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  FormField,
  Input,
  Select,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { useClubDocuments, useClubMe, useCreateClubDocument, useDeleteClubDocument } from '@/modules/clubs/hooks/useClubs'
import { clubDocumentSchema, type ClubDocumentFormData } from '@/modules/clubs/schemas'
import type { ClubDocument } from '@/modules/clubs/types'

function categoryLabel(category?: string | null) {
  switch (category) {
    case 'contract':
      return 'Contrato'
    case 'certificate':
      return 'Certificado'
    case 'license':
      return 'Licença'
    case 'regulation':
      return 'Regulamento'
    default:
      return 'Outro'
  }
}

export default function ClubDocumentsPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()
  const slug = club?.slug
  const { data: documents, isLoading } = useClubDocuments(slug)
  const createMutation = useCreateClubDocument()
  const deleteMutation = useDeleteClubDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formCardRef = useRef<HTMLDivElement>(null)

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClubDocumentFormData>({
    resolver: zodResolver(clubDocumentSchema),
    defaultValues: {
      title: '',
      category: 'contract',
      description: '',
      is_public: true,
      valid_until: '',
      document: undefined as unknown as File,
    } as ClubDocumentFormData,
  })

  const watchedFile = watch('document')
  const isPublic = watch('is_public')

  const sidebarLinks = [
    { label: 'Geral', href: ROUTES.DASHBOARD_CLUB, icon: <FileText className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: <FileText className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.DASHBOARD_CLUB_SETTINGS, icon: <FileText className="h-4 w-4" /> },
    { label: 'Documentos', href: ROUTES.DASHBOARD_CLUB_DOCUMENTS, icon: <FileText className="h-4 w-4" />, active: true },
    { label: 'Patrocinadores', href: ROUTES.DASHBOARD_CLUB_SPONSORS, icon: <FileText className="h-4 w-4" /> },
    { label: 'Transferências', href: ROUTES.DASHBOARD_CLUB_TRANSFERS, icon: <FileText className="h-4 w-4" /> },
  ]

  const documentRows = useMemo(() => (Array.isArray(documents) ? documents : []), [documents])

  const columns = useMemo<ColumnDef<ClubDocument>[]>(() => [
    {
      id: 'document',
      header: 'Documento',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-on-surface">{row.original.title}</p>
          <p className="text-xs text-on-surface-variant">{row.original.description || 'Sem descrição'}</p>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Categoria',
      cell: ({ row }) => <Badge variant="secondary">{categoryLabel(row.original.category)}</Badge>,
    },
    {
      id: 'visibility',
      header: 'Visibilidade',
      cell: ({ row }) => (
        <Badge variant={row.original.is_public ? 'primary' : 'outline'}>
          {row.original.is_public ? 'Público' : 'Privado'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-error hover:bg-error-container/20 hover:text-error"
          onClick={() => {
            if (!slug) return
            if (window.confirm(`Eliminar "${row.original.title}"?`)) {
              deleteMutation.mutate({ slug, documentId: row.original.id })
            }
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ], [deleteMutation, slug])

  const onSubmit = (data: ClubDocumentFormData) => {
    if (!slug) return
    createMutation.mutate(
      {
        slug,
        data: {
          title: data.title,
          category: data.category,
          description: data.description || undefined,
          document: data.document,
          is_public: data.is_public,
          valid_until: data.valid_until || undefined,
        },
      },
      {
        onSuccess: () => {
          reset({
            title: '',
            category: 'contract',
            description: '',
            is_public: true,
            valid_until: '',
            document: undefined as unknown as File,
          } as ClubDocumentFormData)
          if (fileInputRef.current) fileInputRef.current.value = ''
          formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        },
      },
    )
  }

  if (clubLoading || !club) {
    return (
      <DashboardLayout title="Documentos do Clube" subtitle="Carregando biblioteca..." dashboardType="club" sidebarLinks={sidebarLinks}>
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Documentos • ${club.name}`}
      subtitle="Centralize contratos, licenças e regulamentos com uma apresentação limpa e objetiva."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/80 p-xl lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Upload className="h-3.5 w-3.5" />
              Gestão documental
            </div>
            <h1 className="text-3xl font-semibold text-on-surface">Documentos organizados</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Faça upload, classifique e publique documentos do clube sem interromper o fluxo de trabalho.
            </p>
          </div>
          <div className="grid gap-sm sm:grid-cols-2">
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Total</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{documentRows.length}</p>
            </Card>
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Públicos</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{documentRows.filter((doc) => doc.is_public).length}</p>
            </Card>
          </div>
        </section>

        <div className="grid gap-lg xl:grid-cols-[0.95fr_1.05fr]">
          <Card ref={formCardRef} variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Novo documento</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Título" htmlFor="title" error={errors.title?.message} required>
                  <Input id="title" {...register('title')} state={errors.title ? 'error' : 'default'} />
                </FormField>
                <div className="grid gap-md sm:grid-cols-2">
                  <FormField label="Categoria" htmlFor="category" error={errors.category?.message} required>
                    <Select id="category" {...register('category')} state={errors.category ? 'error' : 'default'}>
                      <option value="contract">Contrato</option>
                      <option value="certificate">Certificado</option>
                      <option value="license">Licença</option>
                      <option value="regulation">Regulamento</option>
                      <option value="other">Outro</option>
                    </Select>
                  </FormField>
                  <FormField label="Validade" htmlFor="valid_until" error={errors.valid_until?.message}>
                    <Input id="valid_until" type="date" {...register('valid_until')} state={errors.valid_until ? 'error' : 'default'} />
                  </FormField>
                </div>
                <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
                  <Textarea id="description" rows={4} {...register('description')} />
                </FormField>
                <FormField label="Ficheiro" htmlFor="document" error={errors.document?.message as string | undefined} required>
                  <Input
                    ref={fileInputRef}
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        setValue('document', file, { shouldDirty: true, shouldValidate: true })
                      }
                    }}
                    state={errors.document ? 'error' : 'default'}
                  />
                  <p className="text-[10px] text-outline">{watchedFile ? watchedFile.name : 'PDF, DOC, DOCX, JPG ou PNG'}</p>
                </FormField>
                <div className="flex items-center gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container px-md py-3">
                  <input id="is_public" type="checkbox" {...register('is_public')} className="h-4 w-4 rounded border-outline-variant text-primary" />
                  <label htmlFor="is_public" className="text-sm text-on-surface-variant">
                    Disponibilizar publicamente
                  </label>
                </div>
                <div className="flex flex-wrap gap-sm">
                  <Button type="submit" loading={createMutation.isPending} disabled={!isDirty}>
                    Publicar documento
                  </Button>
                  <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container px-md py-2 text-xs text-on-surface-variant">
                    {isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    {isPublic ? 'Será visível no perfil público' : 'Apenas uso interno'}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Biblioteca de documentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-sm">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : documentRows.length === 0 ? (
                <EmptyState
                  title="Sem documentos"
                  description="Carregue o primeiro documento para começar a estruturar a biblioteca do clube."
                  icon={FileText}
                  action={{
                    label: 'Focar formulário',
                    onClick: () => {
                      document.getElementById('title')?.focus()
                    },
                  }}
                />
              ) : (
                <DataTable columns={columns} data={documentRows} isLoading={false} emptyMessage="Sem documentos." enableSorting={false} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
