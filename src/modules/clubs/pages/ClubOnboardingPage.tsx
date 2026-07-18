import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Send } from 'lucide-react'
import { AuthLayout } from '@/app/layouts'
import { Button, FormField, Input, Select, Textarea } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import { usePublicOrganizations, useSubmitClubRequest } from '@/modules/organizations'
import type { ClubAffiliationCreateData } from '@/modules/organizations'

type ClubOnboardingFormData = ClubAffiliationCreateData & {
  organization_slug: string
}

export default function ClubOnboardingPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const { data: organizations = [], isLoading } = usePublicOrganizations()
  const submitRequest = useSubmitClubRequest()

  useSeo({
    title: 'Onboarding do clube',
    description: 'Configure os dados do clube e submeta o pedido de vinculação a uma organização.',
    path: ROUTES.CLUB_ONBOARDING,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClubOnboardingFormData>({
    defaultValues: {
      organization_slug: '',
      name: '',
      short_name: '',
      country: 'Angola',
      city: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      primary_color: '#014D40',
      secondary_color: '#94D3C1',
      stadium_name: '',
    },
  })

  const onSubmit = async (data: ClubOnboardingFormData) => {
    const { organization_slug, founded_year, stadium_capacity, ...payload } = data
    await submitRequest.mutateAsync({
      slug: organization_slug,
      data: {
        ...payload,
        founded_year: founded_year ? Number(founded_year) : null,
        stadium_capacity: stadium_capacity ? Number(stadium_capacity) : null,
      },
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="w-full max-w-2xl rounded-xl border border-outline-variant bg-surface-container-low p-xl">
          <div className="mb-lg flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-headline-md font-display-lg text-on-surface">Pedido submetido</h1>
          <p className="mt-sm text-sm text-on-surface-variant">
            A organização escolhida recebeu o pedido de vinculação. Quando for aprovado, o clube será criado
            e esta conta passará a administrar o perfil do clube.
          </p>
          <div className="mt-lg">
            <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
              <Building2 className="h-4 w-4" />
              Ir para o dashboard
            </Button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl">
        <div className="mb-lg max-w-2xl">
          <p className="text-xs font-semibold uppercase text-primary">Onboarding do clube</p>
          <h1 className="mt-xs text-headline-lg font-display-lg text-on-surface">Configurar vinculação</h1>
          <p className="mt-sm text-sm text-on-surface-variant">
            Preencha os dados institucionais do clube e escolha a organização que deve validar a afiliação.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-outline-variant bg-surface-container-low p-lg">
          <div className="grid gap-md md:grid-cols-2">
            <FormField label="Organização" htmlFor="organization_slug" error={errors.organization_slug?.message} required>
              <Select
                id="organization_slug"
                {...register('organization_slug', { required: 'Escolha uma organização.' })}
                disabled={isLoading}
              >
                <option value="">{isLoading ? 'A carregar organizações...' : 'Selecionar organização'}</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.slug}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Nome do clube" htmlFor="club_name" error={errors.name?.message} required>
              <Input id="club_name" {...register('name', { required: 'O nome do clube é obrigatório.' })} />
            </FormField>

            <FormField label="Nome curto" htmlFor="short_name">
              <Input id="short_name" {...register('short_name')} />
            </FormField>

            <FormField label="Ano de fundação" htmlFor="founded_year">
              <Input id="founded_year" type="number" min={1800} max={2100} {...register('founded_year')} />
            </FormField>

            <FormField label="País" htmlFor="country">
              <Input id="country" {...register('country')} />
            </FormField>

            <FormField label="Cidade" htmlFor="city">
              <Input id="city" {...register('city')} />
            </FormField>

            <FormField label="Email institucional" htmlFor="email">
              <Input id="email" type="email" {...register('email')} />
            </FormField>

            <FormField label="Telefone" htmlFor="phone">
              <Input id="phone" {...register('phone')} />
            </FormField>

            <FormField label="Website" htmlFor="website">
              <Input id="website" type="url" {...register('website')} />
            </FormField>

            <FormField label="Estádio" htmlFor="stadium_name">
              <Input id="stadium_name" {...register('stadium_name')} />
            </FormField>

            <FormField label="Capacidade do estádio" htmlFor="stadium_capacity">
              <Input id="stadium_capacity" type="number" min={0} {...register('stadium_capacity')} />
            </FormField>

            <div className="grid grid-cols-2 gap-sm">
              <FormField label="Cor primária" htmlFor="primary_color">
                <Input id="primary_color" type="color" {...register('primary_color')} />
              </FormField>
              <FormField label="Cor secundária" htmlFor="secondary_color">
                <Input id="secondary_color" type="color" {...register('secondary_color')} />
              </FormField>
            </div>
          </div>

          <div className="mt-md">
            <FormField label="Descrição" htmlFor="description">
              <Textarea id="description" rows={4} {...register('description')} />
            </FormField>
          </div>

          <div className="mt-lg flex flex-wrap items-center justify-between gap-sm">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Fazer depois
            </Button>
            <Button type="submit" loading={submitRequest.isPending}>
              <Send className="h-4 w-4" />
              Submeter pedido
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
