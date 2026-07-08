import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Palette, Globe, Settings, Eye, LayoutDashboard, ArrowRightLeft, FileText, Users, Handshake } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Textarea } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ClubDetailSkeleton } from '@/modules/clubs/components/ClubSkeleton'
import { useClubMe, useUpdateClub, useUploadClubLogo } from '@/modules/clubs/hooks/useClubs'
import { clubSettingsSchema, type ClubSettingsFormData } from '@/modules/clubs/schemas'

function toFormDefaults(club?: ReturnType<typeof useClubMe>['data']): ClubSettingsFormData {
  return {
    name: club?.name || '',
    short_name: club?.short_name || '',
    founded_year: club?.founded_year || '',
    stadium_name: club?.stadium_name || '',
    stadium_capacity: club?.stadium_capacity || '',
    country: club?.country || '',
    city: club?.city || '',
    email: club?.email || '',
    phone: club?.phone || '',
    website: club?.website || '',
    description: club?.description || '',
    primary_color: club?.primary_color || '#1B4D3E',
    secondary_color: club?.secondary_color || '#D4AF37',
    is_public: club?.is_public ?? true,
  }
}

export default function ClubSettingsPage() {
  const navigate = useNavigate()
  const { data: club, isLoading } = useClubMe()
  const updateMutation = useUpdateClub()
  const uploadLogoMutation = useUploadClubLogo()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ClubSettingsFormData>({
    resolver: zodResolver(clubSettingsSchema),
    defaultValues: toFormDefaults(club),
  })

  const primaryColor = watch('primary_color')
  const secondaryColor = watch('secondary_color')
  const name = watch('name')
  const isPublic = watch('is_public')

  useEffect(() => {
    if (club) {
      reset(toFormDefaults(club))
    }
  }, [club, reset])

  const sidebarLinks = [
    { label: 'Geral', href: ROUTES.DASHBOARD_CLUB, icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.DASHBOARD_CLUB_SETTINGS, icon: <Settings className="h-4 w-4" />, active: true },
    { label: 'Documentos', href: ROUTES.DASHBOARD_CLUB_DOCUMENTS, icon: <FileText className="h-4 w-4" /> },
    { label: 'Patrocinadores', href: ROUTES.DASHBOARD_CLUB_SPONSORS, icon: <Handshake className="h-4 w-4" /> },
    { label: 'Transferências', href: ROUTES.DASHBOARD_CLUB_TRANSFERS, icon: <ArrowRightLeft className="h-4 w-4" /> },
  ]

  const onSubmit = (data: ClubSettingsFormData) => {
    updateMutation.mutate(
      {
        ...data,
        founded_year: data.founded_year === '' ? undefined : Number(data.founded_year),
        stadium_capacity: data.stadium_capacity === '' ? undefined : Number(data.stadium_capacity),
        short_name: data.short_name || undefined,
        stadium_name: data.stadium_name || undefined,
        city: data.city || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
      },
      {
        onSuccess: () => reset(data),
      },
    )
  }

  const onLogoPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    uploadLogoMutation.mutate(file)
  }

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações do Clube"
        subtitle="Ajuste a identidade visual, contactos e visibilidade pública."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <ClubDetailSkeleton />
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout
        title="Configurações do Clube"
        subtitle="Ajuste a identidade visual, contactos e visibilidade pública."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          title="Sem clube associado"
          description="Esta conta ainda não tem um clube associado para configurar."
          icon={Settings}
          action={{
            label: 'Voltar ao dashboard',
            onClick: () => navigate(ROUTES.DASHBOARD_CLUB),
          }}
        />
      </DashboardLayout>
    )
  }

  const logoLetter = (name || club.name || '?').slice(0, 1).toUpperCase()

  return (
    <DashboardLayout
      title={`Configurações • ${club.name}`}
      subtitle="Gira o branding do clube, contactos e disponibilidade pública."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB}>
            <Eye className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Link>
        </Button>
      }
    >
      <div className="mx-auto grid max-w-5xl gap-xl lg:grid-cols-[0.9fr_1.1fr]">
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>
              <Palette className="h-5 w-5 text-primary" />
              <span>Pré-visualização de Marca</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="overflow-hidden rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-high shadow-sm">
              <div
                className="h-44 w-full"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor || '#1B4D3E'} 0%, ${secondaryColor || '#D4AF37'} 100%)`,
                }}
              />
              <div className="p-lg">
                <div className="-mt-16 flex items-end gap-md">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-4 border-surface-container-high bg-surface-container text-2xl font-bold text-primary shadow-lg">
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.name} className="h-full w-full object-cover" />
                    ) : (
                      logoLetter
                    )}
                  </div>
                  <div className="pb-sm">
                    <h3 className="text-xl font-semibold text-on-surface">{name || club.name}</h3>
                    <p className="text-sm text-on-surface-variant">{club.tenant_name || club.tenant_slug || 'Sem organização'}</p>
                  </div>
                </div>
                <div className="mt-md flex flex-wrap gap-sm">
                  <span className="rounded-full border border-outline-variant/20 bg-surface-container px-md py-1.5 text-sm">
                    {isPublic ? 'Perfil público' : 'Perfil privado'}
                  </span>
                  <span className="rounded-full border border-outline-variant/20 bg-surface-container px-md py-1.5 text-sm">
                    {club.status_label || club.status || 'active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-md sm:grid-cols-2">
              <Card variant="glass" padding="md">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Logo</p>
                <div className="mt-sm flex items-center gap-md">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary text-lg font-bold text-on-primary">
                    {club.logo_url ? <img src={club.logo_url} alt={club.name} className="h-full w-full object-cover" /> : logoLetter}
                  </div>
                  <div className="space-y-xs">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={onLogoPick}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} loading={uploadLogoMutation.isPending}>
                      Alterar logo
                    </Button>
                    <p className="text-[10px] text-outline">JPEG, PNG, WebP ou SVG</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Estado público</p>
                <p className="mt-sm text-lg font-semibold text-on-surface">{isPublic ? 'Publicado' : 'Privado'}</p>
                <p className="text-sm text-on-surface-variant">Os visitantes verão o perfil público apenas quando esta opção estiver ativa.</p>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>
              <Globe className="h-5 w-5 text-primary" />
              <span>Detalhes do Clube</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-lg" onSubmit={handleSubmit(onSubmit)}>
              <FormField label="Nome do Clube" htmlFor="name" error={errors.name?.message} required>
                <Input id="name" {...register('name')} state={errors.name ? 'error' : 'default'} />
              </FormField>

              <div className="grid gap-md md:grid-cols-2">
                <FormField label="Sigla" htmlFor="short_name" error={errors.short_name?.message}>
                  <Input id="short_name" {...register('short_name')} state={errors.short_name ? 'error' : 'default'} />
                </FormField>
                <FormField label="Ano de Fundação" htmlFor="founded_year" error={errors.founded_year?.message}>
                  <Input id="founded_year" type="number" {...register('founded_year')} state={errors.founded_year ? 'error' : 'default'} />
                </FormField>
              </div>

              <div className="grid gap-md md:grid-cols-2">
                <FormField label="Estádio" htmlFor="stadium_name" error={errors.stadium_name?.message}>
                  <Input id="stadium_name" {...register('stadium_name')} state={errors.stadium_name ? 'error' : 'default'} />
                </FormField>
                <FormField label="Capacidade" htmlFor="stadium_capacity" error={errors.stadium_capacity?.message}>
                  <Input id="stadium_capacity" type="number" {...register('stadium_capacity')} state={errors.stadium_capacity ? 'error' : 'default'} />
                </FormField>
              </div>

              <div className="grid gap-md md:grid-cols-2">
                <FormField label="País" htmlFor="country" error={errors.country?.message} required>
                  <Input id="country" {...register('country')} state={errors.country ? 'error' : 'default'} />
                </FormField>
                <FormField label="Cidade" htmlFor="city" error={errors.city?.message}>
                  <Input id="city" {...register('city')} state={errors.city ? 'error' : 'default'} />
                </FormField>
              </div>

              <div className="grid gap-md md:grid-cols-2">
                <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                  <Input id="email" {...register('email')} state={errors.email ? 'error' : 'default'} />
                </FormField>
                <FormField label="Telefone" htmlFor="phone" error={errors.phone?.message}>
                  <Input id="phone" {...register('phone')} state={errors.phone ? 'error' : 'default'} />
                </FormField>
              </div>

              <FormField label="Website" htmlFor="website" error={errors.website?.message}>
                <Input id="website" {...register('website')} state={errors.website ? 'error' : 'default'} />
              </FormField>

              <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
                <Textarea id="description" {...register('description')} rows={5} />
              </FormField>

              <div className="grid gap-md md:grid-cols-2">
                <FormField label="Cor Primária" htmlFor="primary_color" error={errors.primary_color?.message} required>
                  <div className="flex gap-sm">
                    <input type="color" className="h-10 w-12 rounded border border-outline-variant bg-transparent" {...register('primary_color')} />
                    <Input id="primary_color" {...register('primary_color')} state={errors.primary_color ? 'error' : 'default'} />
                  </div>
                </FormField>
                <FormField label="Cor Secundária" htmlFor="secondary_color" error={errors.secondary_color?.message} required>
                  <div className="flex gap-sm">
                    <input type="color" className="h-10 w-12 rounded border border-outline-variant bg-transparent" {...register('secondary_color')} />
                    <Input id="secondary_color" {...register('secondary_color')} state={errors.secondary_color ? 'error' : 'default'} />
                  </div>
                </FormField>
              </div>

              <FormField label="Visibilidade" htmlFor="is_public">
                <div className="flex items-center gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <input id="is_public" type="checkbox" {...register('is_public')} className="h-4 w-4 rounded border-outline-variant text-primary" />
                  <label htmlFor="is_public" className="text-sm text-on-surface-variant">
                    Tornar o perfil do clube público
                  </label>
                </div>
              </FormField>

              <div className="flex flex-wrap items-center justify-between gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container/50 p-md">
                <div className="space-y-xs">
                  <p className="font-semibold text-on-surface">Publicação e identidade</p>
                  <p className="text-sm text-on-surface-variant">
                    Atualize nome, marca e visibilidade sem sair da consola.
                  </p>
                </div>
                <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
                  Guardar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
