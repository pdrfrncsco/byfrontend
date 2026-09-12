import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, BadgePercent, CheckCircle2, Globe, Handshake, ImageUp, Plus, Star, Trash2 } from 'lucide-react'
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
  NativeSelect,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { useClubMe, useClubSponsors, useCreateClubSponsor, useDeleteClubSponsor } from '@/modules/clubs/hooks/useClubs'
import { clubSponsorSchema, type ClubSponsorFormData } from '@/modules/clubs/schemas'
import type { ClubSponsor } from '@/modules/clubs/types'
import { MediaAssetPicker } from '@/modules/media_manager/components/MediaAssetPicker'
import type { MediaAsset } from '@/modules/media_manager/types'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'

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
  const formCardRef = useRef<HTMLDivElement>(null)
  const [selectedLogo, setSelectedLogo] = useState<MediaAsset | null>(null)

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

  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  const stats = useMemo(() => {
    const list = Array.isArray(sponsors) ? sponsors : []
    const total = list.length
    const active = list.filter((s) => s.is_active).length
    const main = list.filter((s) => ['main', 'official'].includes(s.sponsor_type || '')).length
    return { total, active, main }
  }, [sponsors])

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
          aria-label={`Eliminar patrocinador "${row.original.name}"`}
          className="text-error hover:bg-error-container/20 hover:text-error"
          onClick={() => {
            if (!slug) return
            if (window.confirm(`Eliminar "${row.original.name}"?`)) {
              deleteMutation.mutate({ slug, sponsorId: row.original.id })
            }
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
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
          logo_asset: selectedLogo?.id,
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
          setSelectedLogo(null)
          formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        },
      },
    )
  }

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Patrocinadores do Clube"
        subtitle="Carregando parceiros..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-md sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Patrocinadores • ${club.name}`}
      subtitle="Destaque parceiros e mantenha o posicionamento comercial do clube com clareza e consistência."
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Voltar ao Painel</span>
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              window.requestAnimationFrame(() => {
                document.getElementById('name')?.focus()
              })
            }}
          >
            <Plus className="mr-xs h-4 w-4" />
            <span>Novo Patrocinador</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Executive Page Header */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-md">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/50 p-1 flex items-center justify-center">
                <ClubLogo logoUrl={club.logo_url} name={club.name} size="lg" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-xs">
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px]">
                    <Star className="mr-1 h-3 w-3" />
                    Gestão Comercial & Branding
                  </Badge>
                  {(club.tenant_name || (club as any).association_name) && (
                    <Badge variant="outline" className="text-[11px] text-on-surface-variant">
                      {club.tenant_name || (club as any).association_name}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
                  Patrocinadores & Rede de Parceiros • {club.name}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Gerencie contratos de patrocínio, ordem de exibição e visibilidade pública da marca.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-xs">
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_MEDIA}>
                  Biblioteca de Media
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_SETTINGS}>
                  Configurações
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 3 KPIs Row */}
        <div className="grid gap-md sm:grid-cols-3">
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Total Parceiros</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Handshake className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{stats.total}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Marcas parceiras cadastradas</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Oficiais / Master</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ba751b]/10 text-[#ba751b]">
                  <Star className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#ba751b]">{stats.main}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Patrocinadores principais e oficiais</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Ativos na Vitrine</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f6e56]/10 text-[#0f6e56]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#0f6e56]">{stats.active}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Exibidos publicamente no portal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-lg xl:grid-cols-[0.95fr_1.05fr]">
          <Card ref={formCardRef} variant="flat" padding="none">
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
                    <NativeSelect id="sponsor_type" {...register('sponsor_type')} state={errors.sponsor_type ? 'error' : 'default'}>
                      <option value="main">Principal</option>
                      <option value="official">Oficial</option>
                      <option value="partner">Parceiro</option>
                      <option value="technical">Técnico</option>
                      <option value="media">Media</option>
                      <option value="other">Outro</option>
                    </NativeSelect>
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
                  <MediaAssetPicker
                    ownerType="club"
                    ownerId={club.id}
                    role="sponsor_logo"
                    accept="image"
                    onSelected={(_, asset) => {
                      setSelectedLogo(asset)
                      setValue('logo', asset.id as unknown as File, { shouldDirty: true, shouldValidate: true })
                    }}
                    trigger={<Button type="button" variant="outline"><ImageUp className="h-4 w-4" />Selecionar da Biblioteca</Button>}
                  />
                  <p className="text-[10px] text-outline">{selectedLogo?.name || (watchedLogo instanceof File ? watchedLogo.name : 'Escolha um logo já carregado na Biblioteca de Media')}</p>
                </FormField>
                <div className="flex items-center gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container px-md py-3">
                  <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-outline-variant text-primary" />
                  <label htmlFor="is_active" className="text-sm text-on-surface-variant">
                    Patrocinador ativo
                  </label>
                </div>
                <div className="flex flex-wrap gap-sm">
                  <Button type="submit" loading={createMutation.isPending} disabled={!isDirty && !selectedLogo}>
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
                  action={{
                    label: 'Focar formulário',
                    onClick: () => {
                      document.getElementById('name')?.focus()
                    },
                  }}
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
