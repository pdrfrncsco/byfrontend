import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button, Card, CardContent, FormField, Input, Textarea } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useCreatePlayer } from '../hooks'
import { playerCreateSchema, type PlayerCreateFormData } from '../schemas'
import { ALL_POSITIONS } from '../constants'

export function PlayerCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreatePlayer()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<PlayerCreateFormData>({
    resolver: zodResolver(playerCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality: '',
      primary_position: undefined,
      email: '',
      phone: '',
      height_cm: undefined,
      weight_kg: undefined,
      foot: undefined,
      bio: '',
      avatar: '',
    },
  })

  // Reset form after successful creation
  useEffect(() => {
    if (createMutation.isSuccess && createMutation.data?.data?.slug) {
      navigate(ROUTES.PLAYER_DETAIL(createMutation.data.data.slug))
    }
  }, [createMutation.isSuccess, createMutation.data, navigate])

  const onSubmit = (data: PlayerCreateFormData) => {
    // Clean empty strings and undefined values
    const payload = {
      ...data,
      date_of_birth: data.date_of_birth || undefined,
      nationality: data.nationality || undefined,
      primary_position: data.primary_position || 'multiple',
      email: data.email || undefined,
      phone: data.phone || undefined,
      height_cm: data.height_cm || undefined,
      weight_kg: data.weight_kg || undefined,
      foot: data.foot || undefined,
      bio: data.bio || undefined,
      avatar: data.avatar || undefined,
    }
    createMutation.mutate(payload)
  }

  const handleReset = () => {
    reset()
  }

  return (
    <div className="player-create-page space-y-lg">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(ROUTES.PLAYERS)}
        className="inline-flex items-center gap-sm text-sm text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos jogadores
      </button>

      {/* Header */}
      <div className="space-y-sm">
        <h1 className="text-2xl font-bold text-on-surface">Novo Jogador</h1>
        <p className="text-on-surface-variant">
          Preencha os dados para criar um novo perfil de jogador.
        </p>
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
                    placeholder="Ex: João"
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
                    placeholder="Ex: Silva"
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
                    placeholder="Ex: Angola, Portugal"
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
                    placeholder="Ex: 180"
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
                    placeholder="Ex: 75"
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
                    placeholder="email@exemplo.com"
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
                    placeholder="+244 9XX XXX XXX"
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
                  placeholder="Breve descrição sobre o jogador..."
                  rows={4}
                />
              </FormField>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container/50 p-md">
              <div className="space-y-xs">
                <p className="font-semibold text-on-surface">Criar Jogador</p>
                <p className="text-sm text-on-surface-variant">
                  Verifique os dados antes de submeter.
                </p>
              </div>
              <div className="flex gap-sm">
                <Button type="button" variant="outline" onClick={handleReset} disabled={!isDirty}>
                  Limpar
                </Button>
                <Button
                  type="submit"
                  loading={createMutation.isPending}
                  disabled={!isDirty || !isValid}
                >
                  <Save className="h-4 w-4" />
                  Criar Jogador
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {createMutation.isError && (
              <div className="rounded-lg bg-error/10 border border-error/30 p-md text-sm text-error">
                Ocorreu um erro ao criar o jogador. Por favor, tente novamente.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
