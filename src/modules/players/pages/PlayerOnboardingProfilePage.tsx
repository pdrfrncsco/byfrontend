import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayerOnboardingStatus, useCreatePlayerMe, useUpdatePlayerMe, useCompleteOnboardingStep } from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

interface ProfileFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  nationality: string
}

export function PlayerOnboardingProfilePage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePlayerOnboardingStatus()
  const createPlayer = useCreatePlayerMe()
  const updatePlayer = useUpdatePlayerMe()
  const completeStep = useCompleteOnboardingStep()
  const form = useForm<ProfileFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality: '',
    },
  })

  useEffect(() => {
    if (!data?.player) return
    form.reset({
      first_name: data.player.first_name ?? '',
      last_name: data.player.last_name ?? '',
      date_of_birth: data.player.date_of_birth?.split('T')[0] ?? '',
      nationality: data.player.nationality ?? '',
    })
  }, [data?.player, form])

  const onSubmit = async (values: ProfileFormData) => {
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      date_of_birth: values.date_of_birth,
      nationality: values.nationality.trim(),
    }
    if (data?.has_player_profile) {
      await updatePlayer.mutateAsync(payload)
    } else {
      await createPlayer.mutateAsync(payload)
    }
    await completeStep.mutateAsync('personal')
    navigate(ROUTES.ONBOARDING_PLAYER_FOOTBALL)
  }

  if (isLoading) {
    return (
      <PlayerOnboardingLayout step={3}>
        <div className="text-sm text-on-surface-variant">A carregar perfil...</div>
      </PlayerOnboardingLayout>
    )
  }

  return (
    <PlayerOnboardingLayout step={3}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg" noValidate>
        <div>
            <h2 className="text-xl font-semibold text-on-surface">
              {data?.has_player_profile ? 'Dados pessoais' : 'Criar perfil de jogador'}
            </h2>
          <p className="mt-xs text-sm text-on-surface-variant">
            {data?.has_player_profile
              ? 'Estes campos identificam o jogador no ecossistema BolaYetu.'
              : 'Preencha os seus dados para criar o perfil e continuar o onboarding.'}
          </p>
        </div>

        <div className="grid gap-md md:grid-cols-2">
          <div>
            <Label htmlFor="first_name">Nome</Label>
            <Input
              id="first_name"
              aria-invalid={Boolean(form.formState.errors.first_name)}
              {...form.register('first_name', {
                required: 'O nome é obrigatório.',
                minLength: { value: 2, message: 'Informe pelo menos 2 caracteres.' },
              })}
            />
            {form.formState.errors.first_name && (
              <p className="mt-xs text-xs text-error">{form.formState.errors.first_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last_name">Apelido</Label>
            <Input
              id="last_name"
              aria-invalid={Boolean(form.formState.errors.last_name)}
              {...form.register('last_name', {
                required: 'O apelido é obrigatório.',
                minLength: { value: 2, message: 'Informe pelo menos 2 caracteres.' },
              })}
            />
            {form.formState.errors.last_name && (
              <p className="mt-xs text-xs text-error">{form.formState.errors.last_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="date_of_birth">Data de nascimento</Label>
            <Input
              id="date_of_birth"
              type="date"
              aria-invalid={Boolean(form.formState.errors.date_of_birth)}
              {...form.register('date_of_birth', { required: 'A data de nascimento é obrigatória.' })}
            />
            {form.formState.errors.date_of_birth && (
              <p className="mt-xs text-xs text-error">{form.formState.errors.date_of_birth.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="nationality">Nacionalidade</Label>
            <Input
              id="nationality"
              placeholder="Angolana"
              aria-invalid={Boolean(form.formState.errors.nationality)}
              {...form.register('nationality', { required: 'A nacionalidade é obrigatória.' })}
            />
            {form.formState.errors.nationality && (
              <p className="mt-xs text-xs text-error">{form.formState.errors.nationality.message}</p>
            )}
          </div>
        </div>

        {(updatePlayer.isError || createPlayer.isError || completeStep.isError) && (
          <p role="alert" className="rounded-md bg-error-container/20 p-sm text-sm text-error">
            Não foi possível guardar o perfil. Verifique os campos e tente novamente.
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={updatePlayer.isPending || createPlayer.isPending || completeStep.isPending}>
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </PlayerOnboardingLayout>
  )
}
