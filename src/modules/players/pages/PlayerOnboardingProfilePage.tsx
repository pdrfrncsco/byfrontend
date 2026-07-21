import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayerOnboardingStatus, useUpdatePlayerMe } from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

interface ProfileFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  nationality: string
  phone: string
}

export function PlayerOnboardingProfilePage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePlayerOnboardingStatus()
  const updatePlayer = useUpdatePlayerMe()
  const form = useForm<ProfileFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (!data?.player) return
    form.reset({
      first_name: data.player.first_name ?? '',
      last_name: data.player.last_name ?? '',
      date_of_birth: data.player.date_of_birth ?? '',
      nationality: data.player.nationality ?? '',
      phone: '',
    })
  }, [data?.player, form])

  const onSubmit = async (values: ProfileFormData) => {
    await updatePlayer.mutateAsync({
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      date_of_birth: values.date_of_birth,
      nationality: values.nationality.trim(),
      phone: values.phone.trim() || undefined,
    })
    navigate(ROUTES.ONBOARDING_PLAYER_FOOTBALL)
  }

  if (isLoading) {
    return (
      <PlayerOnboardingLayout step={1}>
        <div className="text-sm text-on-surface-variant">A carregar perfil...</div>
      </PlayerOnboardingLayout>
    )
  }

  if (data && !data.has_player_profile) {
    return (
      <PlayerOnboardingLayout step={1}>
        <div className="flex items-start gap-md rounded-lg border border-error/30 bg-error-container/10 p-md text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 text-error" />
          <div>
            <h2 className="font-semibold text-on-surface">Perfil de jogador não encontrado</h2>
            <p className="mt-xs text-on-surface-variant">
              Esta conta ainda não tem um perfil de jogador associado.
            </p>
          </div>
        </div>
      </PlayerOnboardingLayout>
    )
  }

  return (
    <PlayerOnboardingLayout step={1}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Dados pessoais</h2>
          <p className="mt-xs text-sm text-on-surface-variant">
            Estes campos identificam o jogador no ecossistema BolaYetu.
          </p>
        </div>

        <div className="grid gap-md md:grid-cols-2">
          <div>
            <Label htmlFor="first_name">Nome</Label>
            <Input id="first_name" {...form.register('first_name', { required: true, minLength: 2 })} />
          </div>
          <div>
            <Label htmlFor="last_name">Apelido</Label>
            <Input id="last_name" {...form.register('last_name', { required: true, minLength: 2 })} />
          </div>
          <div>
            <Label htmlFor="date_of_birth">Data de nascimento</Label>
            <Input id="date_of_birth" type="date" {...form.register('date_of_birth', { required: true })} />
          </div>
          <div>
            <Label htmlFor="nationality">Nacionalidade</Label>
            <Input id="nationality" placeholder="Angolana" {...form.register('nationality', { required: true })} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="phone">Telemóvel</Label>
            <Input id="phone" type="tel" placeholder="+244 923 000 000" {...form.register('phone')} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={updatePlayer.isPending}>
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </PlayerOnboardingLayout>
  )
}
