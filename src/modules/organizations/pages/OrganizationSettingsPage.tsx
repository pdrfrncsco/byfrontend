import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  useOrganizationMe,
  useUpdateOrganization,
  useUploadLogo,
  useUploadBanner
} from '../hooks'
import { organizationUpdateSchema, type OrganizationUpdateFormData } from '../schemas'
import { OrganizationSettingsSkeleton } from '../components'
import { ArrowLeft, Image, UploadCloud, Globe, Eye, Settings, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  // Watch colors for live preview
  const primaryColorWatched = watch('primary_color')
  const secondaryColorWatched = watch('secondary_color')
  const nameWatched = watch('name')

  // Populate form when organization data loads
  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        type: organization.type as any,
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
      onSuccess: () => {
        toast.success('Organização atualizada com sucesso.')
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || 'Erro ao atualizar organização.'
        toast.error(message)
      },
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadLogoMutation.mutate(file, {
      onSuccess: () => {
        toast.success('Logo atualizado com sucesso.')
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || 'Erro ao carregar logo.'
        toast.error(message)
      },
    })
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadBannerMutation.mutate(file, {
      onSuccess: () => {
        toast.success('Banner atualizado com sucesso.')
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || 'Erro ao carregar banner.'
        toast.error(message)
      },
    })
  }

  if (isLoading) {
    return <OrganizationSettingsSkeleton />
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-lg text-center">
        <div className="glass-card max-w-md p-xl space-y-md border border-outline-variant/30">
          <p className="text-on-surface-variant mb-md">
            Não tem nenhuma organização associada a este utilizador.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center gap-xs px-md py-sm rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  const firstLetter = organization.name?.charAt(0) || '?'

  const inputClass =
    'w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm'
  const labelClass = 'block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-xs'
  const errorClass = 'text-body-sm text-error mt-xs text-xs font-semibold'

  return (
    <div className="min-h-screen bg-background text-on-surface pb-xl">
      {/* Background glow effects */}
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      <div className="max-w-4xl mx-auto px-gutter py-xl space-y-lg">
        {/* Header */}
        <div className="space-y-sm">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-xs text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Dashboard</span>
          </Link>
          <h1 className="font-display-lg text-4xl text-primary tracking-tight">
            Definições da Organização
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação.
          </p>
        </div>

        {/* Live Branding Preview Mockup */}
        <div className="glass-card p-0 border border-outline-variant/30 rounded-xl overflow-hidden">
          <div className="p-md border-b border-outline-variant/30 bg-surface-container-low flex items-center gap-xs text-sm font-semibold">
            <Palette className="w-4 h-4 text-primary" />
            <span>Pré-visualização de Marca (Live Preview)</span>
          </div>

          {/* Mini Portal Mockup */}
          <div className="relative h-44 w-full bg-surface-lowest overflow-hidden">
            {organization.banner_url ? (
              <img
                src={organization.banner_url}
                alt="Banner preview"
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div
                className="w-full h-full opacity-40 transition-colors duration-500"
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
                  className="w-16 h-16 rounded-lg object-cover border-2 border-surface-container-high bg-surface-container shadow-md"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-display-lg text-xl border-2 border-surface-container-high shadow-md transition-colors duration-500"
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
        </div>

        {/* Upload Assets Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Logo Card */}
          <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
            <h3 className="font-title-md text-base text-on-surface flex items-center gap-xs">
              <UploadCloud className="w-4 h-4 text-primary" />
              <span>Logótipo Oficial</span>
            </h3>
            <div className="flex items-center gap-md">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="w-20 h-20 rounded-xl object-cover border border-outline-variant/40"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-display-lg text-2xl"
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
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadLogoMutation.isPending}
                  className="px-md py-1.5 bg-surface-bright hover:bg-surface-container-highest border border-outline-variant/40 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {uploadLogoMutation.isPending ? 'A carregar...' : 'Alterar logo'}
                </button>
                <p className="text-[10px] text-outline">
                  JPEG, PNG, WebP ou SVG (máx. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Banner Card */}
          <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
            <h3 className="font-title-md text-base text-on-surface flex items-center gap-xs">
              <Image className="w-4 h-4 text-primary" />
              <span>Banner de Capa</span>
            </h3>
            <div className="flex items-center gap-md">
              {organization.banner_url ? (
                <img
                  src={organization.banner_url}
                  alt="Banner actual"
                  className="w-24 h-20 rounded-xl object-cover border border-outline-variant/40"
                />
              ) : (
                <div className="w-24 h-20 rounded-xl bg-surface-bright flex items-center justify-center border border-outline-variant/20 text-outline">
                  <Image className="w-6 h-6 opacity-30" />
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
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadBannerMutation.isPending}
                  className="px-md py-1.5 bg-surface-bright hover:bg-surface-container-highest border border-outline-variant/40 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {uploadBannerMutation.isPending ? 'A carregar...' : 'Carregar capa'}
                </button>
                <p className="text-[10px] text-outline">
                  Formato paisagem. Recomendado 1200x400 (máx. 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
          {/* General info */}
          <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
            <h3 className="font-title-md text-base text-on-surface flex items-center gap-xs pb-sm border-b border-outline-variant/20">
              <Settings className="w-4 h-4 text-primary" />
              <span>Informações Gerais</span>
            </h3>

            <div className="space-y-md">
              <div>
                <label className={labelClass}>Nome Completo da Organização</label>
                <input
                  {...register('name')}
                  className={inputClass}
                  placeholder="Ex: Federação Angolana de Futebol"
                />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className={labelClass}>Tipo de Organização</label>
                  <select {...register('type')} className={inputClass}>
                    <option value="federation">Federação</option>
                    <option value="association">Associação</option>
                    <option value="league">Liga de Futebol</option>
                    <option value="organizer">Organizador Independente</option>
                    <option value="academy">Academia / Escola</option>
                  </select>
                  {errors.type && <p className={errorClass}>{errors.type.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Estado de Ativação (Sistema)</label>
                  <input
                    value={organization.status_label || organization.status || 'Active'}
                    disabled
                    className={cn(inputClass, 'opacity-60 bg-surface-container/30 cursor-not-allowed font-semibold')}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Breve Apresentação / Descrição</label>
                <textarea
                  {...register('description')}
                  className={inputClass}
                  rows={4}
                  placeholder="Escreva sobre a história, objetivos ou equipa da organização..."
                />
                {errors.description && <p className={errorClass}>{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Contact and address */}
          <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
            <h3 className="font-title-md text-base text-on-surface flex items-center gap-xs pb-sm border-b border-outline-variant/20">
              <Globe className="w-4 h-4 text-primary" />
              <span>Contactos & Localização</span>
            </h3>

            <div className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className={labelClass}>Endereço de Email</label>
                  <input
                    {...register('email')}
                    className={inputClass}
                    placeholder="contacto@organizacao.org"
                  />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Telefone de Contacto</label>
                  <input
                    {...register('phone')}
                    className={inputClass}
                    placeholder="+244 9XX XXX XXX"
                  />
                  {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Sítio Web Oficial</label>
                <input
                  {...register('website')}
                  className={inputClass}
                  placeholder="https://www.organizacao.org"
                />
                {errors.website && <p className={errorClass}>{errors.website.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className={labelClass}>País de Registo</label>
                  <input
                    {...register('country')}
                    className={inputClass}
                    placeholder="Angola"
                  />
                  {errors.country && <p className={errorClass}>{errors.country.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Cidade Sede</label>
                  <input
                    {...register('city')}
                    className={inputClass}
                    placeholder="Luanda"
                  />
                  {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Identity and branding colors */}
          <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
            <h3 className="font-title-md text-base text-on-surface flex items-center gap-xs pb-sm border-b border-outline-variant/20">
              <Palette className="w-4 h-4 text-primary" />
              <span>Cores Corporativas (Custom Branding)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className={labelClass}>Cor Primária</label>
                <div className="flex gap-sm">
                  <input
                    type="color"
                    {...register('primary_color')}
                    className="w-12 h-10 rounded border border-outline-variant bg-transparent cursor-pointer"
                  />
                  <input
                    {...register('primary_color')}
                    className={inputClass}
                    placeholder="#1B4D3E"
                  />
                </div>
                {errors.primary_color && <p className={errorClass}>{errors.primary_color.message}</p>}
              </div>

              <div className="space-y-xs">
                <label className={labelClass}>Cor Secundária</label>
                <div className="flex gap-sm">
                  <input
                    type="color"
                    {...register('secondary_color')}
                    className="w-12 h-10 rounded border border-outline-variant bg-transparent cursor-pointer"
                  />
                  <input
                    {...register('secondary_color')}
                    className={inputClass}
                    placeholder="#D4AF37"
                  />
                </div>
                {errors.secondary_color && <p className={errorClass}>{errors.secondary_color.message}</p>}
              </div>
            </div>
          </div>

          {/* Visibility and region */}
          <div className="glass-card p-lg border border-outline-variant/30 space-y-md">
            <h3 className="font-title-md text-base text-on-surface flex items-center gap-xs pb-sm border-b border-outline-variant/20">
              <Eye className="w-4 h-4 text-primary" />
              <span>Preferências & Visibilidade</span>
            </h3>

            <div className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className={labelClass}>Idioma Principal</label>
                  <select {...register('language')} className={inputClass}>
                    <option value="pt">Português (PT)</option>
                    <option value="en">English (EN)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fuso Horário</label>
                  <select {...register('timezone')} className={inputClass}>
                    <option value="Africa/Luanda">West Africa Time (Luanda)</option>
                    <option value="Africa/Johannesburg">South Africa Time (Johannesburg)</option>
                    <option value="Europe/Lisbon">Western European Time (Lisbon)</option>
                    <option value="UTC">Universal Time Coordinated (UTC)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-sm pt-sm">
                <input
                  id="is_public"
                  type="checkbox"
                  {...register('is_public')}
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-on-surface-variant cursor-pointer">
                  Organização pública (visível na lista geral para utilizadores e adeptos)
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-md">
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="btn-primary px-xl py-sm rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {updateMutation.isPending ? 'A guardar alterações...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
