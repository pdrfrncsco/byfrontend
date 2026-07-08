import { useMemo, useRef } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, BadgePercent, Handshake, ImageUp, Trash2 } from 'lucide-react'
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
import { useClubMe, useClubSponsors, useCreateClubSponsor, useDeleteClubSponsor } from '@/modules/clubs/hooks/useClubs'
import { clubSponsorSchema, type ClubSponsorFormData } from '@/modules/clubs/schemas'
import type { ClubSponsor } from '@/modules/clubs/types'

function sponsorTypeLabel(type?: string | null) {
  switch (type) {
    case 'main':
      return 'Principal'
    case 'official':
      return 'Oficial'
    case 'partner':
      return 'Parceiro'
    case 'technical':
      return 'Técnico'
    case 'media':
      return 'Media'
    default:
      return 'Outro'
  }
}

export default function ClubSponsorsPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()
  const slug = club?.slug
  const { data: sponsors, isLoading } = useClubSponsors(slug)
  const createMutation = useCreateClubSponsor()
  const deleteMutation = useDeleteClubSponsor()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClubSponsorFormData>({
    resolver: zodResolver(clubSponsorSchema),
    defaultValues: {
      name: '',
      sponsor_type: 'partner',
      description: '',
      website: '',
      is_active: true,
      sort_order: '',
      logo: undefined,
    },
  })

  const watchedLogo = watch('logo')
  const isActive = watch('is_active')

  const sidebarLinks = [
    { label: 'Geral', href: ROUTES.DASHBOARD_CLUB, icon: <Handshake className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: <Handshake className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.DASHBOARD_CLUB_SETTINGS, icon: <Handshake className="h-4 w-4" /> },
    { label: 'Documentos', href: ROUTES.DASHBOARD_CLUB_DOCUMENTS, icon: <Handshake className="h-4 w-4" /> },
    { label: 'Patrocinadores', href: ROUTES.DASHBOARD_CLUB_SPONSORS, icon: <Handshake className="h-4 w-4" />, active: true },
    { label: 'Transferências', href: ROUTES.DASHBOARD_CLUB_TRANSFERS, icon: <Handshake className="h-4 w-4" /> },
  ]

  const sponsorRows = useMemo(() => (Array.isArray(sponsors) ? sponsors : []), [sponsors])

  const columns = useMemo<ColumnDef<ClubSponsor>[]>(() => [
    {
      id: 'sponsor',
      header: 'Patrocinador',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-on-surface">{row.original.name}</p>
          <p className="text-xs text-on-surface-variant">{row.original.description || 'Sem descrição'}</p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: ({ row }) => <Badge variant="secondary">{sponsorTypeLabel(row.original.sponsor_type)}</Badge>,
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'primary' : 'outline'}>
          {row.original.is_active ? 'Ativo' : 'Inativo'}
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
            if (window.confirm(`Eliminar "${row.original.name}"?`)) {
              deleteMutation.mutate({ slug, sponsorId: row.original.id })
            }
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ], [deleteMutation, slug])

  const onSubmit = (data: ClubSponsorFormData) => {
    if (!slug) return
    createMutation.mutate(
      {
        slug,
        data: {
          name: data.name,
          sponsor_type: data.sponsor_type,
          description: data.description || undefined,
          website: data.website || undefined,
          logo: data.logo,
          is_active: data.is_active,
          sort_order: data.sort_order === '' ? undefined : Number(data.sort_order),
        },
      },
      {
        onSuccess: () => {
          reset({
            name: '',
            sponsor_type: 'partner',
            description: '',
            website: '',
            is_active: true,
            sort_order: '',
            logo: undefined,
          })
          if (logoInputRef.current) logoInputRef.current.value = ''
        },
      },
    )
  }

  if (clubLoading || !club) {
    return (
      <DashboardLayout title="Patrocinadores do Clube" subtitle="Carregando parceiros..." dashboardType="club" sidebarLinks={sidebarLinks}>
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Patrocinadores • ${club.name}`}
      subtitle="Destaque parceiros e mantenha o posicionamento comercial do clube com clareza e consistência."
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
              <BadgePercent className="h-3.5 w-3.5" />
              Gestão comercial
            </div>
            <h1 className="text-3xl font-semibold text-on-surface">Rede de patrocinadores</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Carregue logos, defina prioridade e mantenha o branding alinhado ao perfil público do clube.
            </p>
          </div>
          <div className="grid gap-sm sm:grid-cols-2">
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Total</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{sponsorRows.length}</p>
            </Card>
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Ativos</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{sponsorRows.filter((item) => item.is_active).length}</p>
            </Card>
          </div>
        </section>

        <div className="grid gap-lg xl:grid-cols-[0.95fr_1.05fr]">
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Novo patrocinador</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Nome" htmlFor="name" error={errors.name?.message} required>
                  <Input id="name" {...register('name')} state={errors.name ? 'error' : 'default'} />
                </FormField>
                <div className="grid gap-md sm:grid-cols-2">
                  <FormField label="Tipo" htmlFor="sponsor_type" error={errors.sponsor_type?.message} required>
                    <Select id="sponsor_type" {...register('sponsor_type')} state={errors.sponsor_type ? 'error' : 'default'}>
                      <option value="main">Principal</option>
                      <option value="official">Oficial</option>
                      <option value="partner">Parceiro</option>
                      <option value="technical">Técnico</option>
                      <option value="media">Media</option>
                      <option value="other">Outro</option>
                    </Select>
                  </FormField>
                  <FormField label="Ordem" htmlFor="sort_order" error={errors.sort_order?.message}>
                    <Input id="sort_order" type="number" {...register('sort_order')} state={errors.sort_order ? 'error' : 'default'} />
                  </FormField>
                </div>
                <FormField label="Website" htmlFor="website" error={errors.website?.message}>
                  <Input id="website" {...register('website')} state={errors.website ? 'error' : 'default'} />
                </FormField>
                <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
                  <Textarea id="description" rows={4} {...register('description')} />
                </FormField>
                <FormField label="Logo" htmlFor="logo" error={errors.logo?.message as string | undefined}>
                  <Input
                    ref={logoInputRef}
                    id="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        setValue('logo', file, { shouldDirty: true, shouldValidate: true })
                      }
                    }}
                    state={errors.logo ? 'error' : 'default'}
                  />
                  <p className="text-[10px] text-outline">{watchedLogo ? watchedLogo.name : 'PNG, JPG, WebP ou SVG'}</p>
                </FormField>
                <div className="flex items-center gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container px-md py-3">
                  <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-outline-variant text-primary" />
                  <label htmlFor="is_active" className="text-sm text-on-surface-variant">
                    Patrocinador ativo
                  </label>
                </div>
                <div className="flex flex-wrap gap-sm">
                  <Button type="submit" loading={createMutation.isPending} disabled={!isDirty}>
                    Guardar patrocinador
                  </Button>
                  <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container px-md py-2 text-xs text-on-surface-variant">
                    {isActive ? <ImageUp className="h-3.5 w-3.5" /> : <Handshake className="h-3.5 w-3.5" />}
                    {isActive ? 'Será publicado na vitrine' : 'Ficará oculto no perfil público'}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Patrocinadores registados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-sm">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : sponsorRows.length === 0 ? (
                <EmptyState
                  title="Sem patrocinadores"
                  description="Adicione parceiros para começar a construir a vitrine comercial do clube."
                  icon={Handshake}
                />
              ) : (
                <DataTable columns={columns} data={sponsorRows} isLoading={false} emptyMessage="Sem patrocinadores." enableSorting={false} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
