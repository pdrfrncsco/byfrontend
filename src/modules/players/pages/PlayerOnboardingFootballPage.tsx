import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, Input, Label, Select, Textarea } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { ALL_POSITIONS } from '../constants'
import { usePlayerOnboardingStatus, useUpdatePlayerMe } from '../hooks'
import type { PlayerFoot, PlayerPosition } from '../types'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

interface FootballFormData {
  primary_position: PlayerPosition
  foot: PlayerFoot | ''
  height_cm: string
  weight_kg: string
  bio: string
}

function optionalNumber(value: string) {
  return value ? Number(value) : undefined
}

export function PlayerOnboardingFootballPage() {
  const navigate = useNavigate()
  const { data } = usePlayerOnboardingStatus()
  const updatePlayer = useUpdatePlayerMe()
  const form = useForm<FootballFormData>({
    defaultValues: {
      primary_position: 'multiple',
      foot: '',
      height_cm: '',
      weight_kg: '',
      bio: '',
    },
  })

  useEffect(() => {
    if (!data?.player) return
    form.reset({
      primary_position: data.player.primary_position ?? 'multiple',
      foot: data.player.foot ?? '',
      height_cm: data.player.height_cm ? String(data.player.height_cm) : '',
      weight_kg: data.player.weight_kg ? String(data.player.weight_kg) : '',
      bio: data.player.bio ?? '',
    })
  }, [data?.player, form])

  const onSubmit = async (values: FootballFormData) => {
    await updatePlayer.mutateAsync({
      primary_position: values.primary_position,
      foot: values.foot || undefined,
      height_cm: optionalNumber(values.height_cm),
      weight_kg: optionalNumber(values.weight_kg),
      bio: values.bio.trim() || undefined,
    })
    navigate(ROUTES.ONBOARDING_PLAYER_REVIEW)
  }

  return (
    <PlayerOnboardingLayout step={2}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Perfil futebolístico</h2>
          <p className="mt-xs text-sm text-on-surface-variant">
            Estes dados ajudam clubes e organizadores a validar o seu perfil desportivo.
          </p>
        </div>

        <div className="grid gap-md md:grid-cols-2">
          <div>
            <Label htmlFor="primary_position">Posição principal</Label>
            <Select
              id="primary_position"
              {...form.register('primary_position', {
                validate: value => value !== 'multiple',
              })}
            >
              <option value="multiple">Selecionar posição</option>
              {ALL_POSITIONS.filter(position => position.value !== 'multiple').map(position => (
                <option key={position.value} value={position.value}>
                  {position.label} - {position.fullLabel}
                </option>
              ))}
            </Select>
            {form.formState.errors.primary_position && (
              <p className="mt-xs text-xs text-error">Selecione uma posição principal.</p>
            )}
          </div>

          <div>
            <Label htmlFor="foot">Pé preferido</Label>
            <Select id="foot" {...form.register('foot')}>
              <option value="">Selecionar</option>
              <option value="right">Direito</option>
              <option value="left">Esquerdo</option>
              <option value="both">Ambos</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="height_cm">Altura (cm)</Label>
            <Input id="height_cm" type="number" min={100} max={250} {...form.register('height_cm')} />
          </div>

          <div>
            <Label htmlFor="weight_kg">Peso (kg)</Label>
            <Input id="weight_kg" type="number" min={30} max={200} {...form.register('weight_kg')} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="bio">Resumo do jogador</Label>
            <Textarea
              id="bio"
              rows={5}
              placeholder="Ex.: médio ofensivo com experiência em provas provinciais."
              {...form.register('bio')}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-between">
          <Button asChild variant="secondary">
            <Link to={ROUTES.ONBOARDING_PLAYER}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button type="submit" loading={updatePlayer.isPending}>
            Rever perfil
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </PlayerOnboardingLayout>
  )
}
