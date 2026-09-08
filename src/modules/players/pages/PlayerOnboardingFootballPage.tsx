import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, Input, Label, NativeSelect, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { ALL_POSITIONS } from '../constants'
import { playerFootballStepSchema, type PlayerFootballStepFormData } from '../schemas/player-onboarding.schema'
import { usePlayerOnboardingStatus, useUpdatePlayerMe, useCompleteOnboardingStep, usePlayerWizard } from '../hooks'
import { useAutoSave } from '@/components/ui/wizard'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

export function PlayerOnboardingFootballPage() {
  const navigate = useNavigate()
  const { data } = usePlayerOnboardingStatus()
  const updatePlayer = useUpdatePlayerMe()
  const completeStep = useCompleteOnboardingStep()
  const { draftData: wizardData, updateData, markStepCompleted } = usePlayerWizard()

  const form = useForm<PlayerFootballStepFormData>({
    resolver: zodResolver(playerFootballStepSchema),
    defaultValues: {
      primary_position: wizardData.primary_position || 'cm',
      foot: wizardData.foot || undefined,
      height_cm: wizardData.height_cm ? Number(wizardData.height_cm) : undefined,
      weight_kg: wizardData.weight_kg ? Number(wizardData.weight_kg) : undefined,
    },
  })

  useEffect(() => {
    if (!data?.player) return
    form.reset({
      primary_position: wizardData.primary_position || data.player.primary_position || undefined,
      foot: wizardData.foot || data.player.foot || undefined,
      height_cm: wizardData.height_cm ? Number(wizardData.height_cm) : (data.player.height_cm ?? undefined),
      weight_kg: wizardData.weight_kg ? Number(wizardData.weight_kg) : (data.player.weight_kg ?? undefined),
    })
  }, [data?.player, form, wizardData])

  useAutoSave<PlayerFootballStepFormData>(
    form.watch(),
    form.formState.isDirty,
    async (values: Partial<PlayerFootballStepFormData>) => {
      updateData(values)
    }
  )

  const onSubmit = async (values: PlayerFootballStepFormData) => {
    updateData(values)
    await updatePlayer.mutateAsync({
      primary_position: values.primary_position,
      foot: values.foot || undefined,
      height_cm: values.height_cm ? Number(values.height_cm) : undefined,
      weight_kg: values.weight_kg ? Number(values.weight_kg) : undefined,
    })
    markStepCompleted('football')
    await completeStep.mutateAsync('football')
    navigate(ROUTES.ONBOARDING_PLAYER_CONTACT)
  }

  return (
    <PlayerOnboardingLayout
      step={3}
      onNext={form.handleSubmit(onSubmit)}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_PROFILE)}
      onSaveDraft={() => updateData(form.getValues())}
    >
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Perfil futebolístico</CardTitle>
          <CardDescription>
            Estes dados ajudam clubes e organizadores a validar o seu perfil desportivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-md" noValidate>
            <div className="grid gap-md md:grid-cols-2">
              <div className="space-y-xs">
                <Label htmlFor="primary_position">Posição principal</Label>
                <NativeSelect
                  id="primary_position"
                  {...form.register('primary_position')}
                >
                  <option value="">Selecionar posição</option>
                  {ALL_POSITIONS.filter(position => position.value !== 'multiple').map(position => (
                    <option key={position.value} value={position.value}>
                      {position.label} - {position.fullLabel}
                    </option>
                  ))}
                </NativeSelect>
                {form.formState.errors.primary_position && (
                  <p className="text-xs text-destructive">{form.formState.errors.primary_position.message}</p>
                )}
              </div>

              <div className="space-y-xs">
                <Label htmlFor="foot">Pé preferido</Label>
                <NativeSelect id="foot" {...form.register('foot')}>
                  <option value="">Selecionar</option>
                  <option value="right">Direito</option>
                  <option value="left">Esquerdo</option>
                  <option value="both">Ambos</option>
                </NativeSelect>
              </div>

              <div className="space-y-xs">
                <Label htmlFor="height_cm">Altura (cm)</Label>
                <Input id="height_cm" type="number" min={100} max={250} {...form.register('height_cm')} />
                {form.formState.errors.height_cm && (
                  <p className="text-xs text-destructive">{form.formState.errors.height_cm.message}</p>
                )}
              </div>

              <div className="space-y-xs">
                <Label htmlFor="weight_kg">Peso (kg)</Label>
                <Input id="weight_kg" type="number" min={30} max={200} {...form.register('weight_kg')} />
                {form.formState.errors.weight_kg && (
                  <p className="text-xs text-destructive">{form.formState.errors.weight_kg.message}</p>
                )}
              </div>
            </div>

            {updatePlayer.isError && (
              <p role="alert" className="rounded-md bg-destructive/10 p-sm text-sm text-destructive">
                Não foi possível guardar o perfil futebolístico. Verifique os dados e tente novamente.
              </p>
            )}

            <div className="flex justify-between pt-md">
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ONBOARDING_PLAYER_PROFILE)}>
                <ArrowLeft className="mr-xs h-4 w-4" />
                Voltar
              </Button>
              <Button type="submit" loading={updatePlayer.isPending}>
                Continuar
                <ArrowRight className="ml-xs h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PlayerOnboardingLayout>
  )
}
