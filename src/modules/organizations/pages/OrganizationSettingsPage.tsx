import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useOrganizationMe, useUpdateOrganization, useUploadLogo } from '../hooks'
import { organizationUpdateSchema, type OrganizationUpdateFormData } from '../schemas'

export function OrganizationSettingsPage() {
  const { data: organization, isLoading } = useOrganizationMe()
  const updateMutation = useUpdateOrganization()
  const uploadLogoMutation = useUploadLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OrganizationUpdateFormData>({
    resolver: zodResolver(organizationUpdateSchema),
  })

  // Populate form when organization data loads
  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        type: organization.type,
        primary_color: organization.primary_color,
        secondary_color: organization.secondary_color,
        country: organization.country,
        city: organization.city || '',
        email: organization.email || '',
        phone: organization.phone || '',
        website: organization.website || '',
        description: organization.description || '',
        is_public: organization.is_public,
        language: organization.language,
        timezone: organization.timezone,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">A carregar organização...</p>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-on-surface-variant mb-md">
            Não tem nenhuma organização associada.
          </p>
          <Link
            to="/dashboard"
            className="text-primary hover:underline"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
  const labelClass = 'block text-body-sm font-bold text-on-surface mb-xs'
  const errorClass = 'text-body-sm text-error mt-xs'

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-4xl mx-auto px-gutter py-xl">
        {/* Header */}
        <div className="mb-xl">
          <Link
            to="/dashboard"
            className="text-on-surface-variant hover:text-on-surface text-body-sm mb-md inline-block"
          >
            ← Voltar ao dashboard
          </Link>
          <h1 className="font-display-lg text-headline-lg text-primary mb-sm">
            Definições da Organização
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Gira a informação da sua organização
          </p>
        </div>

        {/* Logo Section */}
        <div className="bg-surface-container rounded-lg border border-outline-variant p-lg mb-lg">
          <h2 className="font-title-md text-title-md text-on-surface mb-md">Logo</h2>
          <div className="flex items-center gap-lg">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center text-on-primary-container font-display-lg"
                style={{ backgroundColor: organization.primary_color || '#014d40' }}
              >
                {organization.name.charAt(0)}
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLogoMutation.isPending}
                className="px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {uploadLogoMutation.isPending ? 'A carregar...' : 'Carregar logo'}
              </button>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                JPEG, PNG, WebP ou SVG. Máximo 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Organization Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-surface-container rounded-lg border border-outline-variant p-lg space-y-md"
        >
          <h2 className="font-title-md text-title-md text-on-surface mb-md">
            Informação Geral
          </h2>

          {/* Name */}
          <div>
            <label className={labelClass}>Nome</label>
            <input
              {...register('name')}
              className={inputClass}
              placeholder="Nome da organização"
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className={labelClass}>Tipo</label>
              <select {...register('type')} className={inputClass}>
                <option value="federation">Federação</option>
                <option value="association">Associação</option>
                <option value="league">Liga</option>
                <option value="organizer">Organizador</option>
                <option value="academy">Academia</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input
                value={organization.status_label}
                disabled
                className={`${inputClass} opacity-60`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              {...register('description')}
              className={inputClass}
              rows={3}
              placeholder="Descrição da organização"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className={labelClass}>Email</label>
              <input
                {...register('email')}
                className={inputClass}
                placeholder="email@organizacao.com"
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                {...register('phone')}
                className={inputClass}
                placeholder="+244 9XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input
              {...register('website')}
              className={inputClass}
              placeholder="https://www.organizacao.com"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className={labelClass}>País</label>
              <input
                {...register('country')}
                className={inputClass}
                placeholder="Angola"
              />
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input
                {...register('city')}
                className={inputClass}
                placeholder="Luanda"
              />
            </div>
          </div>

          {/* Branding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className={labelClass}>Cor Primária</label>
              <div className="flex items-center gap-sm">
                <input
                  type="color"
                  {...register('primary_color')}
                  className="w-12 h-10 rounded border border-outline-variant bg-transparent cursor-pointer"
                />
                <input
                  {...register('primary_color')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cor Secundária</label>
              <div className="flex items-center gap-sm">
                <input
                  type="color"
                  {...register('secondary_color')}
                  className="w-12 h-10 rounded border border-outline-variant bg-transparent cursor-pointer"
                />
                <input
                  {...register('secondary_color')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-sm">
            <input
              type="checkbox"
              {...register('is_public')}
              className="w-4 h-4 rounded border-outline-variant"
            />
            <label className="text-body-md text-on-surface">
              Organização pública (visível na lista de organizações)
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-md">
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="px-xl py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updateMutation.isPending ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
