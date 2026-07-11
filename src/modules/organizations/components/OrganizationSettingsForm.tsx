import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Globe, Settings, Palette, Eye } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Select, Textarea } from '@/components/ui'
import { organizationUpdateSchema, type OrganizationUpdateFormData } from '../schemas/organization.schema'
import { BrandPreviewCard } from './BrandPreviewCard'
import { MediaSettingsCard } from './MediaSettingsCard'

interface OrganizationSettingsFormProps {
  organization: any
  updateMutation: any
  uploadLogoMutation: any
  uploadBannerMutation: any
}

export function OrganizationSettingsForm({
  organization,
  updateMutation,
  uploadLogoMutation,
  uploadBannerMutation,
}: OrganizationSettingsFormProps) {
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

  const firstLetter = organization.name?.charAt(0) || '?'

  return (
    <div className="mx-auto max-w-4xl space-y-lg pb-xl">
      <BrandPreviewCard
        bannerUrl={organization.banner_url}
        logoUrl={organization.logo_url}
        orgName={nameWatched || organization.name}
        orgType={organization.type}
        orgTypeLabel={organization.type_label}
        primaryColor={primaryColorWatched}
        secondaryColor={secondaryColorWatched}
        firstLetter={nameWatched?.charAt(0) || firstLetter}
      />

      <MediaSettingsCard
        logoUrl={organization.logo_url}
        bannerUrl={organization.banner_url}
        orgName={organization.name}
        primaryColor={primaryColorWatched}
        firstLetter={firstLetter}
        logoInputRef={logoInputRef}
        bannerInputRef={bannerInputRef}
        onLogoUpload={handleLogoUpload}
        onBannerUpload={handleBannerUpload}
        isLogoUploading={uploadLogoMutation.isPending}
        isBannerUploading={uploadBannerMutation.isPending}
      />

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
  )
}
