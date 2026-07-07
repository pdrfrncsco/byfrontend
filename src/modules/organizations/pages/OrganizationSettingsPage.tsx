import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Eye,
  Globe,
  Image,
  Palette,
  Settings,
  UploadCloud,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  Textarea,
} from '@/components/ui'
import {
  useOrganizationMe,
  useUpdateOrganization,
  useUploadLogo,
  useUploadBanner,
} from '../hooks'
import { organizationUpdateSchema, type OrganizationUpdateFormData } from '../schemas/organization.schema'
import { OrganizationSettingsSkeleton } from '../components'

export function OrganizationSettingsPage() {
  const { data: organization, isLoading } = useOrganizationMe()
  const updateMutation = useUpdateOrganization()
  const uploadLogoMutation = useUploadLogo()
  const uploadBannerMutation = useUploadBanner()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<OrganizationUpdateFormData>({
    resolver: zodResolver(organizationUpdateSchema),
  })

  const primaryColorWatched = watch('primary_color')
  const secondaryColorWatched = watch('secondary_color')
  const nameWatched = watch('name')

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        type: organization.type as OrganizationUpdateFormData['type'],
        primary_color: organization.primary_color ?? '#1B4D3E',
        secondary_color: organization.secondary_color ?? '#D4AF37',
        country: organization.country,
        city: organization.city || '',
        email: organization.email || '',
        phone: organization.phone || '',
        website: organization.website || '',
        description: organization.description || '',
        is_public: organization.is_public ?? false,
        language: organization.language || 'pt',
        timezone: organization.timezone || 'Africa/Luanda',
      })
    }
  }, [organization, reset])

  const onSubmit = (data: OrganizationUpdateFormData) => {
    updateMutation.mutate(data, {
      onSuccess: () => toast.success('Organização atualizada com sucesso.'),
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Erro ao atualizar organização.'
        toast.error(message)
      },
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadLogoMutation.mutate(file, {
      onSuccess: () => toast.success('Logo atualizado com sucesso.'),
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Erro ao carregar logo.'
        toast.error(message)
      },
    })
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadBannerMutation.mutate(file, {
      onSuccess: () => toast.success('Banner atualizado com sucesso.'),
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Erro ao carregar banner.'
        toast.error(message)
      },
    })
  }

  if (isLoading) {
    return <OrganizationSettingsSkeleton />
  }

  if (!organization) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-lg text-center">
        <Card padding="lg" className="max-w-md space-y-md">
          <p className="mb-md text-on-surface-variant">
            Não tem nenhuma organização associada a este utilizador.
          </p>
          <Button variant="primary" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  const firstLetter = organization.name?.charAt(0) || '?'

  return (
    <div className="min-h-screen bg-background pb-xl text-on-surface">
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      <div className="mx-auto max-w-4xl space-y-lg px-gutter py-xl">
        <div className="space-y-sm">
          <Button variant="ghost" size="sm" asChild className="h-auto px-0 text-xs">
            <Link to="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar ao Dashboard</span>
            </Link>
          </Button>
          <h1 className="font-display-lg text-4xl tracking-tight text-primary">Definições da Organização</h1>
          <p className="text-body-md text-on-surface-variant">
            Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação.
          </p>
        </div>

        <Card padding="none" className="overflow-hidden">
          <CardHeader>
            <CardTitle>
              <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Pré-visualização de Marca (Live Preview)</span>
            </CardTitle>
          </CardHeader>

          <div className="relative h-44 w-full overflow-hidden bg-surface-lowest">
            {organization.banner_url ? (
              <img src={organization.banner_url} alt="Banner preview" className="h-full w-full object-cover opacity-60" />
            ) : (
              <div
                className="h-full w-full opacity-40 transition-colors duration-500"
                style={{
                  background: `linear-gradient(135deg, ${primaryColorWatched || '#1B4D3E'} 0%, #031427 100%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />

            <div className="absolute bottom-md left-md flex items-end gap-md">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt="Logo preview"
                  className="h-16 w-16 rounded-lg border-2 border-surface-container-high bg-surface-container object-cover shadow-md"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-surface-container-high font-display-lg text-xl text-white shadow-md transition-colors duration-500"
                  style={{ backgroundColor: primaryColorWatched || '#1B4D3E' }}
                >
                  {nameWatched?.charAt(0) || firstLetter}
                </div>
              )}

              <div className="mb-xs">
                <h4 className="font-title-md text-sm text-on-surface drop-shadow-md">
                  {nameWatched || organization.name}
                </h4>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider drop-shadow"
                  style={{ color: secondaryColorWatched || '#D4AF37' }}
                >
                  {organization.type_label || organization.type}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          <Card padding="md" className="space-y-md">
            <CardTitle className="pb-0">
              <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Logótipo Oficial</span>
            </CardTitle>
            <div className="flex items-center gap-md">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="h-20 w-20 rounded-xl border border-outline-variant/40 object-cover"
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-xl font-display-lg text-2xl text-white"
                  style={{ backgroundColor: primaryColorWatched }}
                >
                  {firstLetter}
                </div>
              )}
              <div className="space-y-xs">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  loading={uploadLogoMutation.isPending}
                >
                  {uploadLogoMutation.isPending ? 'A carregar...' : 'Alterar logo'}
                </Button>
                <p className="text-[10px] text-outline">JPEG, PNG, WebP ou SVG (máx. 5MB)</p>
              </div>
            </div>
          </Card>

          <Card padding="md" className="space-y-md">
            <CardTitle className="pb-0">
              <Image className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Banner de Capa</span>
            </CardTitle>
            <div className="flex items-center gap-md">
              {organization.banner_url ? (
                <img
                  src={organization.banner_url}
                  alt="Banner actual"
                  className="h-20 w-24 rounded-xl border border-outline-variant/40 object-cover"
                />
              ) : (
                <div className="flex h-20 w-24 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-bright text-outline">
                  <Image className="h-6 w-6 opacity-30" aria-hidden="true" />
                </div>
              )}
              <div className="space-y-xs">
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bannerInputRef.current?.click()}
                  loading={uploadBannerMutation.isPending}
                >
                  {uploadBannerMutation.isPending ? 'A carregar...' : 'Carregar capa'}
                </Button>
                <p className="text-[10px] text-outline">Formato paisagem. Recomendado 1200x400 (máx. 5MB)</p>
              </div>
            </div>
          </Card>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
          <Card padding="md" className="space-y-md">
            <CardHeader className="border-none bg-transparent p-0 pb-sm">
              <CardTitle>
                <Settings className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Informações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md p-0">
              <FormField label="Nome Completo da Organização" htmlFor="name" error={errors.name?.message} required>
                <Input id="name" {...register('name')} placeholder="Ex: Federação Angolana de Futebol" state={errors.name ? 'error' : 'default'} />
              </FormField>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <FormField label="Tipo de Organização" htmlFor="type" error={errors.type?.message} required>
                  <Select id="type" {...register('type')} state={errors.type ? 'error' : 'default'}>
                    <option value="federation">Federação</option>
                    <option value="association">Associação</option>
                    <option value="league">Liga de Futebol</option>
                    <option value="organizer">Organizador Independente</option>
                    <option value="academy">Academia / Escola</option>
                  </Select>
                </FormField>

                <FormField label="Estado de Ativação (Sistema)">
                  <Input
                    value={organization.status_label || organization.status || 'Active'}
                    disabled
                    className="cursor-not-allowed bg-surface-container/30 font-semibold opacity-60"
                  />
                </FormField>
              </div>

              <FormField label="Breve Apresentação / Descrição" htmlFor="description" error={errors.description?.message}>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  placeholder="Escreva sobre a história, objetivos ou equipa da organização..."
                  error={!!errors.description}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card padding="md" className="space-y-md">
            <CardHeader className="border-none bg-transparent p-0 pb-sm">
              <CardTitle>
                <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Contactos & Localização</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md p-0">
              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <FormField label="Endereço de Email" htmlFor="email" error={errors.email?.message}>
                  <Input id="email" {...register('email')} placeholder="contacto@organizacao.org" state={errors.email ? 'error' : 'default'} />
                </FormField>
                <FormField label="Telefone de Contacto" htmlFor="phone" error={errors.phone?.message}>
                  <Input id="phone" {...register('phone')} placeholder="+244 9XX XXX XXX" state={errors.phone ? 'error' : 'default'} />
                </FormField>
              </div>

              <FormField label="Sítio Web Oficial" htmlFor="website" error={errors.website?.message}>
                <Input id="website" {...register('website')} placeholder="https://www.organizacao.org" state={errors.website ? 'error' : 'default'} />
              </FormField>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <FormField label="País de Registo" htmlFor="country" error={errors.country?.message} required>
                  <Input id="country" {...register('country')} placeholder="Angola" state={errors.country ? 'error' : 'default'} />
                </FormField>
                <FormField label="Cidade Sede" htmlFor="city" error={errors.city?.message}>
                  <Input id="city" {...register('city')} placeholder="Luanda" state={errors.city ? 'error' : 'default'} />
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card padding="md" className="space-y-md">
            <CardHeader className="border-none bg-transparent p-0 pb-sm">
              <CardTitle>
                <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Cores Corporativas (Custom Branding)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-md p-0 md:grid-cols-2">
              <FormField label="Cor Primária" error={errors.primary_color?.message}>
                <div className="flex gap-sm">
                  <input type="color" {...register('primary_color')} className="h-10 w-12 cursor-pointer rounded border border-outline-variant bg-transparent" />
                  <Input {...register('primary_color')} placeholder="#1B4D3E" state={errors.primary_color ? 'error' : 'default'} />
                </div>
              </FormField>
              <FormField label="Cor Secundária" error={errors.secondary_color?.message}>
                <div className="flex gap-sm">
                  <input type="color" {...register('secondary_color')} className="h-10 w-12 cursor-pointer rounded border border-outline-variant bg-transparent" />
                  <Input {...register('secondary_color')} placeholder="#D4AF37" state={errors.secondary_color ? 'error' : 'default'} />
                </div>
              </FormField>
            </CardContent>
          </Card>

          <Card padding="md" className="space-y-md">
            <CardHeader className="border-none bg-transparent p-0 pb-sm">
              <CardTitle>
                <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Preferências & Visibilidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md p-0">
              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <FormField label="Idioma Principal" htmlFor="language">
                  <Select id="language" {...register('language')}>
                    <option value="pt">Português (PT)</option>
                    <option value="en">English (EN)</option>
                    <option value="fr">Français (FR)</option>
                  </Select>
                </FormField>
                <FormField label="Fuso Horário" htmlFor="timezone">
                  <Select id="timezone" {...register('timezone')}>
                    <option value="Africa/Luanda">West Africa Time (Luanda)</option>
                    <option value="Africa/Johannesburg">South Africa Time (Johannesburg)</option>
                    <option value="Europe/Lisbon">Western European Time (Lisbon)</option>
                    <option value="UTC">Universal Time Coordinated (UTC)</option>
                  </Select>
                </FormField>
              </div>

              <div className="flex items-center gap-sm pt-sm">
                <input
                  id="is_public"
                  type="checkbox"
                  {...register('is_public')}
                  className="h-4 w-4 cursor-pointer rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="is_public" className="cursor-pointer text-sm font-medium text-on-surface-variant">
                  Organização pública (visível na lista geral para utilizadores e adeptos)
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-md">
            <Button type="submit" variant="primary" disabled={!isDirty} loading={updateMutation.isPending}>
              {updateMutation.isPending ? 'A guardar alterações...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
