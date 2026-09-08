import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
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
    if (!data?.player) return
    form.reset({
      first_name: wizardData.first_name || data.player.first_name || '',
      last_name: wizardData.last_name || data.player.last_name || '',
      date_of_birth: wizardData.date_of_birth || data.player.date_of_birth?.split('T')[0] || '',
      nationality: wizardData.nationality || data.player.nationality || '',
      bio: wizardData.bio || data.player.bio || '',
    })
  }, [data?.player, form, wizardData])

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
      onNext={form.handleSubmit(onSubmit)}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER)}
      onSaveDraft={() => updateData(form.getValues())}
    >
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {data?.has_player_profile ? 'Dados pessoais' : 'Criar perfil de atleta'}
          </CardTitle>
          <CardDescription>
            {data?.has_player_profile
              ? 'Estes campos identificam o jogador no ecossistema BolaYetu.'
              : 'Preencha os seus dados para criar o perfil e continuar o onboarding.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="flex justify-end pt-md">
              <Button type="submit" loading={updatePlayer.isPending || createPlayer.isPending || completeStep.isPending}>
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
