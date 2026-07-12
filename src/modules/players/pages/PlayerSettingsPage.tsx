import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, FormField, Input, Textarea, Badge } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayer, useUpdatePlayer } from '../hooks'
import { playerUpdateSchema, type PlayerUpdateFormData } from '../schemas'
import { PlayerFormSkeleton } from '../components'
import { ALL_POSITIONS, POSITION_COLOR, STATUS_COLOR } from '../constants'

export function PlayerSettingsPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: playerData, isLoading, isError } = usePlayer(slug ?? '')
  const updateMutation = useUpdatePlayer(slug ?? '')

  const player = playerData?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PlayerUpdateFormData>({
    resolver: zodResolver(playerUpdateSchema),
    mode: 'onBlur',
  })

  // Populate form when player data loads
  useEffect(() => {
    if (player) {
      reset({
        first_name: player.first_name || '',
        last_name: player.last_name || '',
        date_of_birth: player.date_of_birth?.split('T')[0] || '',
        nationality: player.nationality || '',
        primary_position: player.primary_position || undefined,
        email: player.email || '',
        phone: player.phone || '',
        height_cm: player.height_cm || undefined,
        weight_kg: player.weight_kg || undefined,
        foot: player.foot || undefined,
        bio: player.bio || '',
        avatar: player.avatar || '',
        status: player.status || undefined,
      })
    }
  }, [player, reset])

  // Navigate after successful update
  useEffect(() => {
    if (updateMutation.isSuccess) {
      navigate(ROUTES.PLAYER_DETAIL(slug ?? ''))
    }
  }, [updateMutation.isSuccess, navigate, slug])

  const onSubmit = (data: PlayerUpdateFormData) => {
    const payload = {
      ...data,
      date_of_birth: data.date_of_birth || undefined,
      nationality: data.nationality || undefined,
      primary_position: data.primary_position || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      height_cm: data.height_cm || undefined,
      weight_kg: data.weight_kg || undefined,
      foot: data.foot || undefined,
      bio: data.bio || undefined,
      avatar: data.avatar || undefined,
      status: data.status || undefined,
    }
    updateMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="space-y-lg">
        <div className="flex items-center gap-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>A carregar dados do jogador...</span>
        </div>
        <Card variant="flat" padding="lg">
          <PlayerFormSkeleton />
        </Card>
      </div>
    )
  }

  if (isError || !player) {
    return (
      <div className="space-y-lg">
        <Card variant="flat" padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-md py-xl">
            <AlertCircle className="h-12 w-12 text-error" />
            <h2 className="text-xl font-semibold text-on-surface">Jogador não encontrado</h2>
            <p className="text-on-surface-variant">
              O jogador que procura não existe ou foi removido.
            </p>
            <Button onClick={() => navigate(ROUTES.PLAYERS)}>
              Voltar aos jogadores
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="player-settings-page space-y-lg">
      {/* Back Navigation */}
      <Link
        to={ROUTES.PLAYER_DETAIL(slug ?? '')}
        className="inline-flex items-center gap-sm text-sm text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao perfil
      </Link>

      {/* Header */}
      <div className="flex items-start gap-lg">
        {/* Avatar Preview */}
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-outline-variant/20 text-2xl font-bold text-on-primary shadow-sm"
          style={{
            background: positionColor,
            boxShadow: `0 10px 30px ${positionColor}33`,
          }}
        >
          {player.avatar ? (
            <img src={player.avatar} alt={player.full_name} className="h-full w-full rounded-3xl object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="space-y-sm">
          <div className="flex items-center gap-md">
            <h1 className="text-2xl font-bold text-on-surface">{player.full_name}</h1>
            <Badge
              variant="outline"
              style={{
                borderColor: statusColor,
                color: statusColor,
                background: `${statusColor}15`,
              }}
            >
              {player.status_label}
            </Badge>
          </div>
          <p className="text-on-surface-variant">
            Edite as informações do perfil do jogador.
          </p>
        </div>
      </div>

      {/* Form */}
      <Card variant="flat" padding="none">
        <CardContent className="p-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
            {/* Personal Information */}
            <div className="space-y-md">
              <h2 className="text-lg font-semibold text-on-surface">Informação Pessoal</h2>
              <div className="grid gap-md md:grid-cols-2">
                <FormField
                  label="Nome"
                  htmlFor="first_name"
                  error={errors.first_name?.message}
                  required
                >
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    state={errors.first_name ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Apelido"
                  htmlFor="last_name"
                  error={errors.last_name?.message}
                  required
                >
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    state={errors.last_name ? 'error' : 'default'}
                  />
                </FormField>
              </div>

              <div className="grid gap-md md:grid-cols-2">
                <FormField
                  label="Data de Nascimento"
                  htmlFor="date_of_birth"
                  error={errors.date_of_birth?.message}
                >
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register('date_of_birth')}
                    state={errors.date_of_birth ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Nacionalidade"
                  htmlFor="nationality"
                  error={errors.nationality?.message}
                >
                  <Input
                    id="nationality"
                    {...register('nationality')}
                    state={errors.nationality ? 'error' : 'default'}
                  />
                </FormField>
              </div>
            </div>

            {/* Football Information */}
            <div className="space-y-md">
              <h2 className="text-lg font-semibold text-on-surface">Informação Futebolística</h2>
              <div className="grid gap-md md:grid-cols-3">
                <FormField
                  label="Posição Principal"
                  htmlFor="primary_position"
                  error={errors.primary_position?.message}
                >
                  <select
                    id="primary_position"
                    {...register('primary_position')}
                    className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="">Selecione uma posição</option>
                    {ALL_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.fullLabel} ({pos.label})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Pé Preferido"
                  htmlFor="foot"
                  error={errors.foot?.message}
                >
                  <select
                    id="foot"
                    {...register('foot')}
                    className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="left">Esquerdo</option>
                    <option value="right">Direito</option>
                    <option value="both">Ambos</option>
                  </select>
                </FormField>

                <FormField
                  label="Estado"
                  htmlFor="status"
                  error={errors.status?.message}
                >
                  <select
                    id="status"
                    {...register('status')}
                    className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="active">Ativo</option>
                    <option value="retired">Reformado</option>
                    <option value="banned">Banido</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </FormField>
              </div>

              <div className="grid gap-md md:grid-cols-2">
                <FormField
                  label="URL do Avatar"
                  htmlFor="avatar"
                  error={errors.avatar?.message}
                >
                  <Input
                    id="avatar"
                    {...register('avatar')}
                    state={errors.avatar ? 'error' : 'default'}
                    placeholder="https://..."
                  />
                </FormField>
              </div>
            </div>

            {/* Physical Information */}
            <div className="space-y-md">
              <h2 className="text-lg font-semibold text-on-surface">Dados Físicos</h2>
              <div className="grid gap-md md:grid-cols-3">
                <FormField
                  label="Altura (cm)"
                  htmlFor="height_cm"
                  error={errors.height_cm?.message}
                >
                  <Input
                    id="height_cm"
                    type="number"
                    {...register('height_cm')}
                    state={errors.height_cm ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Peso (kg)"
                  htmlFor="weight_kg"
                  error={errors.weight_kg?.message}
                >
                  <Input
                    id="weight_kg"
                    type="number"
                    {...register('weight_kg')}
                    state={errors.weight_kg ? 'error' : 'default'}
                  />
                </FormField>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-md">
              <h2 className="text-lg font-semibold text-on-surface">Contacto</h2>
              <div className="grid gap-md md:grid-cols-2">
                <FormField
                  label="Email"
                  htmlFor="email"
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    state={errors.email ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Telefone"
                  htmlFor="phone"
                  error={errors.phone?.message}
                >
                  <Input
                    id="phone"
                    {...register('phone')}
                    state={errors.phone ? 'error' : 'default'}
                  />
                </FormField>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-md">
              <FormField
                label="Biografia"
                htmlFor="bio"
                error={errors.bio?.message}
              >
                <Textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                />
              </FormField>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container/50 p-md">
              <div className="space-y-xs">
                <p className="font-semibold text-on-surface">Guardar Alterações</p>
                <p className="text-sm text-on-surface-variant">
                  Verifique os dados antes de submeter.
                </p>
              </div>
              <Button
                type="submit"
                loading={updateMutation.isPending}
                disabled={!isDirty}
              >
                <Save className="h-4 w-4" />
                Guardar Alterações
              </Button>
            </div>

            {/* Error Message */}
            {updateMutation.isError && (
              <div className="rounded-lg bg-error/10 border border-error/30 p-md text-sm text-error">
                Ocorreu um erro ao atualizar o jogador. Por favor, tente novamente.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
