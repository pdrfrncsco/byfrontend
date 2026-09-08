import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Input, Label } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { playerProfileStepSchema, type PlayerProfileStepFormData } from '../schemas/player-onboarding.schema'
import { usePlayerOnboardingStatus, useCreatePlayerMe, useUpdatePlayerMe, useCompleteOnboardingStep, usePlayerWizard } from '../hooks'
import { useAutoSave } from '@/components/ui/wizard'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

export function PlayerOnboardingProfilePage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePlayerOnboardingStatus()
  const createPlayer = useCreatePlayerMe()
  const updatePlayer = useUpdatePlayerMe()
  const completeStep = useCompleteOnboardingStep()
  const { draftData: wizardData, updateData, markStepCompleted } = usePlayerWizard()
  const hasPopulated = useRef(false)

  const form = useForm<PlayerProfileStepFormData>({
    resolver: zodResolver(playerProfileStepSchema),
    defaultValues: {
      first_name: wizardData.first_name ?? '',
      last_name: wizardData.last_name ?? '',
      date_of_birth: wizardData.date_of_birth ?? '',
      nationality: wizardData.nationality ?? '',
      bio: wizardData.bio ?? '',
    },
  })

  useEffect(() => {
    if (!data?.player || hasPopulated.current) return
    hasPopulated.current = true
    form.reset({
      first_name: wizardData.first_name || data.player.first_name || '',
      last_name: wizardData.last_name || data.player.last_name || '',
      date_of_birth: wizardData.date_of_birth || data.player.date_of_birth?.split('T')[0] || '',
      nationality: wizardData.nationality || data.player.nationality || '',
      bio: wizardData.bio || data.player.bio || '',
    })
  }, [data?.player, form])

  useAutoSave<PlayerProfileStepFormData>(
    form.watch(),
    form.formState.isDirty,
    async (values: Partial<PlayerProfileStepFormData>) => {
      updateData(values)
    }
  )

  const onSubmit = async (values: PlayerProfileStepFormData) => {
    updateData(values)
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      date_of_birth: values.date_of_birth || undefined,
      nationality: values.nationality?.trim() || undefined,
      bio: values.bio?.trim() || undefined,
    }

    if (data?.has_player_profile) {
      await updatePlayer.mutateAsync(payload)
    } else {
      await createPlayer.mutateAsync(payload)
    }

    markStepCompleted('personal')
    await completeStep.mutateAsync('personal')
    navigate(ROUTES.ONBOARDING_PLAYER_FOOTBALL)
  }

  if (isLoading) {
    return (
      <PlayerOnboardingLayout step={2}>
        <div className="text-sm text-muted-foreground p-md">A carregar perfil...</div>
      </PlayerOnboardingLayout>
    )
  }

  return (
    <PlayerOnboardingLayout
      step={2}
      isSaving={updatePlayer.isPending || createPlayer.isPending || completeStep.isPending}
      onNext={form.handleSubmit(onSubmit)}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER)}
      onSaveDraft={() => updateData(form.getValues())}
    >
      <div className="space-y-lg">
        <div>
          <h2 className="text-xl font-bold text-on-surface">
            {data?.has_player_profile ? 'Dados pessoais' : 'Criar perfil de atleta'}
          </h2>
          <p className="mt-xs text-sm text-on-surface-variant">
            {data?.has_player_profile
              ? 'Estes campos identificam o jogador no ecossistema BolaYetu.'
              : 'Preencha os seus dados para criar o perfil e continuar o onboarding.'}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-md" noValidate>
          <div className="grid gap-md md:grid-cols-2">
            <div className="space-y-xs">
              <Label htmlFor="first_name">Nome</Label>
              <Input
                id="first_name"
                aria-invalid={Boolean(form.formState.errors.first_name)}
                {...form.register('first_name')}
              />
              {form.formState.errors.first_name && (
                <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-xs">
              <Label htmlFor="last_name">Apelido</Label>
              <Input
                id="last_name"
                aria-invalid={Boolean(form.formState.errors.last_name)}
                {...form.register('last_name')}
              />
              {form.formState.errors.last_name && (
                <p className="text-xs text-destructive">{form.formState.errors.last_name.message}</p>
              )}
            </div>
            <div className="space-y-xs">
              <Label htmlFor="date_of_birth">Data de nascimento</Label>
              <Input
                id="date_of_birth"
                type="date"
                aria-invalid={Boolean(form.formState.errors.date_of_birth)}
                {...form.register('date_of_birth')}
              />
              {form.formState.errors.date_of_birth && (
                <p className="text-xs text-destructive">{form.formState.errors.date_of_birth.message}</p>
              )}
            </div>
            <div className="space-y-xs">
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input
                id="nationality"
                placeholder="Angolana"
                aria-invalid={Boolean(form.formState.errors.nationality)}
                {...form.register('nationality')}
              />
              {form.formState.errors.nationality && (
                <p className="text-xs text-destructive">{form.formState.errors.nationality.message}</p>
              )}
            </div>
          </div>

          {(updatePlayer.isError || createPlayer.isError || completeStep.isError) && (
            <p role="alert" className="rounded-md bg-destructive/10 p-sm text-sm text-destructive">
              Não foi possível guardar o perfil. Verifique os campos e tente novamente.
            </p>
          )}
        </form>
      </div>
    </PlayerOnboardingLayout>
  )
}
