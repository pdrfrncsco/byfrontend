import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '@/app/layouts'
import { Button, Input, NativeSelect, Textarea, Card, Label } from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import { usePublicOrganizations, useSubmitClubRequest } from '@/modules/organizations'
import { WizardShell, type WizardStep, useAutoSave } from '@/components/ui/wizard'
import { useClubWizard } from '../hooks/useClubWizard'
import {
  clubInstitutionalStepSchema,
  clubFacilitiesStepSchema,
  clubIdentityStepSchema,
  clubAffiliationStepSchema,
  type ClubInstitutionalStepFormData,
  type ClubFacilitiesStepFormData,
  type ClubIdentityStepFormData,
  type ClubAffiliationStepFormData,
} from '../schemas/club-onboarding.schema'

export default function ClubOnboardingPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const { data: organizations = [], isLoading: loadingOrgs } = usePublicOrganizations()
  const submitRequest = useSubmitClubRequest()
  const { currentStepIndex, completedSteps, draftData: wizardData, setStep, updateData, markStepCompleted, reset } = useClubWizard()

  useSeo({
    title: 'Onboarding do Clube',
    description: 'Configure os dados do clube e submeta o pedido de vinculação a uma organização.',
    path: ROUTES.CLUB_ONBOARDING,
  })

  // ── Step 1: Institutional Form ──────────────────────────────────────────────
  const form1 = useForm<ClubInstitutionalStepFormData>({
    resolver: zodResolver(clubInstitutionalStepSchema),
    defaultValues: {
      name: wizardData.name || '',
      short_name: wizardData.short_name || '',
      founded_year: wizardData.founded_year ? Number(wizardData.founded_year) : undefined,
      country: wizardData.country || 'Angola',
      city: wizardData.city || '',
    },
  })
  useAutoSave<ClubInstitutionalStepFormData>(form1.watch(), form1.formState.isDirty, async (vals) => updateData(vals))

  // ── Step 2: Facilities Form ──────────────────────────────────────────────────
  const form2 = useForm<ClubFacilitiesStepFormData>({
    resolver: zodResolver(clubFacilitiesStepSchema),
    defaultValues: {
      stadium_name: wizardData.stadium_name || '',
      stadium_capacity: wizardData.stadium_capacity ? Number(wizardData.stadium_capacity) : undefined,
    },
  })
  useAutoSave<ClubFacilitiesStepFormData>(form2.watch(), form2.formState.isDirty, async (vals) => updateData(vals))

  // ── Step 3: Identity Form ────────────────────────────────────────────────────
  const form3 = useForm<ClubIdentityStepFormData>({
    resolver: zodResolver(clubIdentityStepSchema),
    defaultValues: {
      primary_color: wizardData.primary_color || '#014D40',
      secondary_color: wizardData.secondary_color || '#94D3C1',
      email: wizardData.email || '',
      phone: wizardData.phone || '',
      website: wizardData.website || '',
      description: wizardData.description || '',
    },
  })
  useAutoSave<ClubIdentityStepFormData>(form3.watch(), form3.formState.isDirty, async (vals) => updateData(vals))

  // ── Step 4: Affiliation Form ─────────────────────────────────────────────────
  const form4 = useForm<ClubAffiliationStepFormData>({
    resolver: zodResolver(clubAffiliationStepSchema),
    defaultValues: {
      organization_slug: wizardData.organization_slug || '',
    },
  })
  useAutoSave<ClubAffiliationStepFormData>(form4.watch(), form4.formState.isDirty, async (vals) => updateData(vals))

  const steps: WizardStep[] = [
    { id: 'institutional', label: 'Institucional' },
    { id: 'facilities', label: 'Instalações' },
    { id: 'identity', label: 'Identidade & Contactos' },
    { id: 'affiliation', label: 'Afiliação & Envio' },
  ]

  const handleNextStep1 = (values: ClubInstitutionalStepFormData) => {
    updateData(values)
    markStepCompleted('institutional')
    setStep(1)
  }

  const handleNextStep2 = (values: ClubFacilitiesStepFormData) => {
    updateData(values)
    markStepCompleted('facilities')
    setStep(2)
  }

  const handleNextStep3 = (values: ClubIdentityStepFormData) => {
    updateData(values)
    markStepCompleted('identity')
    setStep(3)
  }

  const handleSubmitFinal = async (values: ClubAffiliationStepFormData) => {
    updateData(values)
    const allData = { ...wizardData, ...values }
    
    await submitRequest.mutateAsync({
      slug: allData.organization_slug!,
      data: {
        name: allData.name!,
        short_name: allData.short_name,
        country: allData.country,
        city: allData.city,
        email: allData.email,
        phone: allData.phone,
        website: allData.website,
        description: allData.description,
        primary_color: allData.primary_color,
        secondary_color: allData.secondary_color,
        stadium_name: allData.stadium_name,
        founded_year: allData.founded_year ? Number(allData.founded_year) : null,
        stadium_capacity: allData.stadium_capacity ? Number(allData.stadium_capacity) : null,
      },
    })
    markStepCompleted('affiliation')
    reset()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-2xl border-border bg-card p-xl">
          <div className="mb-lg flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Pedido submetido</h1>
          <p className="mt-sm text-sm text-muted-foreground">
            A organização escolhida recebeu o pedido de vinculação. Quando for aprovado, o clube será criado
            e esta conta passará a administrar o perfil do clube.
          </p>
          <div className="mt-lg">
            <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
              <Building2 className="mr-xs h-4 w-4" />
              Ir para o dashboard
            </Button>
          </div>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <WizardShell
      title="Onboarding do Clube"
      subtitle="Configure os dados do clube e submeta o pedido de vinculação a uma organização."
      steps={steps}
      currentStepIndex={currentStepIndex}
      completedSteps={completedSteps}
      canGoBack={currentStepIndex > 0}
      isLastStep={currentStepIndex === steps.length - 1}
      isSaving={submitRequest.isPending}
      onBack={() => setStep(Math.max(0, currentStepIndex - 1))}
      onNext={() => {
        if (currentStepIndex === 0) form1.handleSubmit(handleNextStep1)()
        if (currentStepIndex === 1) form2.handleSubmit(handleNextStep2)()
        if (currentStepIndex === 2) form3.handleSubmit(handleNextStep3)()
        if (currentStepIndex === 3) form4.handleSubmit(handleSubmitFinal)()
      }}
    >
      {/* STEP 1: Institutional */}
      {currentStepIndex === 0 && (
        <div className="space-y-lg">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Dados Institucionais</h2>
            <p className="mt-xs text-sm text-on-surface-variant">Identifique o clube com as informações básicas de fundação.</p>
          </div>
          <form onSubmit={form1.handleSubmit(handleNextStep1)} className="space-y-md" noValidate>
            <div className="grid gap-md md:grid-cols-2">
              <FormField label="Nome do clube" htmlFor="name" error={form1.formState.errors.name?.message} required>
                <Input id="name" {...form1.register('name')} />
              </FormField>

              <FormField label="Nome curto" htmlFor="short_name">
                <Input id="short_name" {...form1.register('short_name')} />
              </FormField>

              <FormField label="Ano de fundação" htmlFor="founded_year">
                <Input id="founded_year" type="number" min={1800} max={2100} {...form1.register('founded_year')} />
              </FormField>

              <FormField label="País" htmlFor="country">
                <Input id="country" {...form1.register('country')} />
              </FormField>

              <FormField label="Cidade" htmlFor="city">
                <Input id="city" {...form1.register('city')} />
              </FormField>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: Facilities */}
      {currentStepIndex === 1 && (
        <div className="space-y-lg">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Instalações e Estádio</h2>
            <p className="mt-xs text-sm text-on-surface-variant">Informe o local de jogos e capacidade do estádio do clube.</p>
          </div>
          <form onSubmit={form2.handleSubmit(handleNextStep2)} className="space-y-md" noValidate>
            <div className="grid gap-md md:grid-cols-2">
              <FormField label="Nome do Estádio" htmlFor="stadium_name">
                <Input id="stadium_name" {...form2.register('stadium_name')} />
              </FormField>

              <FormField label="Capacidade do Estádio" htmlFor="stadium_capacity">
                <Input id="stadium_capacity" type="number" min={0} {...form2.register('stadium_capacity')} />
              </FormField>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Identity & Contacts */}
      {currentStepIndex === 2 && (
        <div className="space-y-lg">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Identidade Visual & Contactos</h2>
            <p className="mt-xs text-sm text-on-surface-variant">Personalize as cores e informe os meios oficiais de contacto.</p>
          </div>
          <form onSubmit={form3.handleSubmit(handleNextStep3)} className="space-y-md" noValidate>
            <div className="grid gap-md md:grid-cols-2">
              <div className="grid grid-cols-2 gap-sm">
                <FormField label="Cor primária" htmlFor="primary_color">
                  <Input id="primary_color" type="color" {...form3.register('primary_color')} />
                </FormField>
                <FormField label="Cor secundária" htmlFor="secondary_color">
                  <Input id="secondary_color" type="color" {...form3.register('secondary_color')} />
                </FormField>
              </div>

              <FormField label="Email institucional" htmlFor="email" error={form3.formState.errors.email?.message}>
                <Input id="email" type="email" {...form3.register('email')} />
              </FormField>

              <FormField label="Telefone" htmlFor="phone">
                <Input id="phone" {...form3.register('phone')} />
              </FormField>

              <FormField label="Website" htmlFor="website" error={form3.formState.errors.website?.message}>
                <Input id="website" type="url" {...form3.register('website')} />
              </FormField>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="description">Descrição / História do Clube</Label>
              <Textarea id="description" rows={4} {...form3.register('description')} />
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: Affiliation & Submission */}
      {currentStepIndex === 3 && (
        <div className="space-y-lg">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Afiliação à Organização</h2>
            <p className="mt-xs text-sm text-on-surface-variant">Escolha a associação ou liga que irá validar o registo do clube.</p>
          </div>
          <form onSubmit={form4.handleSubmit(handleSubmitFinal)} className="space-y-md" noValidate>
            <FormField label="Organização de Destino" htmlFor="organization_slug" error={form4.formState.errors.organization_slug?.message} required>
              <NativeSelect id="organization_slug" {...form4.register('organization_slug')} disabled={loadingOrgs}>
                <option value="">{loadingOrgs ? 'A carregar organizações...' : 'Selecionar organização'}</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </NativeSelect>
            </FormField>

            <div className="rounded-lg border border-border bg-muted/40 p-md text-sm text-muted-foreground">
              Ao submeter, o pedido ficará pendente de aprovação pelos administradores da organização selecionada.
            </div>
          </form>
        </div>
      )}
    </WizardShell>
  )
}
