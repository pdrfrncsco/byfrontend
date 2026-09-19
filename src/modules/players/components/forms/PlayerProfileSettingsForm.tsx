import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Handshake,
  HelpCircle,
  Save,
  Sparkles,
  User,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  NativeSelect,
  Textarea,
} from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { PlayerAvatarUpload } from '../PlayerAvatarUpload'
import { useUpdatePlayerMe } from '../../hooks'
import { playerUpdateSchema, type PlayerUpdateFormData } from '../../schemas'
import { ALL_POSITIONS, POSITION_COLOR } from '../../constants'
import { playerRoutes } from '../../routes'
import type { Player } from '../../types'

interface PlayerProfileSettingsFormProps {
  player: Player
}

export function PlayerProfileSettingsForm({ player }: PlayerProfileSettingsFormProps) {
  const { t } = useTranslation()
  const updateMutation = useUpdatePlayerMe()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PlayerUpdateFormData>({
    resolver: zodResolver(playerUpdateSchema),
    mode: 'onBlur',
  })

  const avatar = watch('avatar')
  const isPublic = watch('is_public')

  useEffect(() => {
    if (player) {
      reset({
        first_name: player.first_name || '',
        last_name: player.last_name || '',
        date_of_birth: player.date_of_birth?.split('T')[0] || '',
        nationality: player.nationality || '',
        primary_position: player.primary_position || undefined,
        height_cm: player.height_cm || undefined,
        weight_kg: player.weight_kg || undefined,
        foot: player.foot || undefined,
        bio: player.bio || '',
        avatar: player.avatar || player.profile_photo_url || '',
        is_public: player.is_public ?? false,
        status: player.status || undefined,
      })
    }
  }, [player, reset])

  const onSubmit = (data: PlayerUpdateFormData) => {
    updateMutation.mutate({
      ...data,
      date_of_birth: data.date_of_birth || undefined,
      nationality: data.nationality || undefined,
      primary_position: data.primary_position || undefined,
      height_cm: data.height_cm ? Number(data.height_cm) : undefined,
      weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
      foot: data.foot || undefined,
      bio: data.bio || undefined,
      avatar: data.avatar || undefined,
      is_public: data.is_public ?? false,
      status: data.status || undefined,
    })
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#534ab7'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
      {/* Coluna Principal (65%) */}
      <div className="space-y-lg lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
          {/* Foto de Perfil */}
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <CardHeader className="border-b border-outline-variant/20 pb-md">
              <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                <User className="h-4 w-4 text-primary" />
                Fotografia de Apresentação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-lg">
              <div className="flex flex-col gap-lg sm:flex-row sm:items-center">
                <PlayerAvatarUpload
                  slug={player.slug}
                  ownerId={player.id}
                  avatarUrl={avatar || player.profile_photo_url || player.avatar}
                  initials={initials}
                  accentColor={positionColor}
                  onUploaded={(url) => setValue('avatar', url, { shouldDirty: true })}
                />
                <div className="space-y-xs text-xs text-on-surface-variant">
                  <p className="font-semibold text-on-surface">Diretrizes da Foto de Perfil</p>
                  <p>Carregue uma fotografia nítida, com boa iluminação e de preferência com equipamento desportivo oficial ou fundo neutro.</p>
                  <p className="text-[11px] text-on-surface-variant/80">Formatos aceites: JPG, PNG ou WebP. Tamanho máximo recomendado: 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais & Civis */}
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <CardHeader className="border-b border-outline-variant/20 pb-md">
              <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                <User className="h-4 w-4 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-md p-lg sm:grid-cols-2">
              <FormField
                label={t('players.form.firstName') || 'Primeiro Nome'}
                htmlFor="first_name"
                error={errors.first_name?.message}
                required
              >
                <Input id="first_name" {...register('first_name')} />
              </FormField>

              <FormField
                label={t('players.form.lastName') || 'Último Nome / Apelido'}
                htmlFor="last_name"
                error={errors.last_name?.message}
                required
              >
                <Input id="last_name" {...register('last_name')} />
              </FormField>

              <FormField
                label={t('players.form.dateOfBirth') || 'Data de Nascimento'}
                htmlFor="date_of_birth"
                error={errors.date_of_birth?.message}
              >
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              </FormField>

              <FormField
                label={t('players.form.nationality') || 'Nacionalidade'}
                htmlFor="nationality"
                error={errors.nationality?.message}
              >
                <Input id="nationality" placeholder="Ex: Angola" {...register('nationality')} />
              </FormField>
            </CardContent>
          </Card>

          {/* Atributos Físicos & Desportivos */}
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <CardHeader className="border-b border-outline-variant/20 pb-md">
              <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                <Sparkles className="h-4 w-4 text-primary" />
                Perfil Desportivo & Biometria
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-md p-lg sm:grid-cols-3">
              <FormField
                label={t('players.form.primaryPosition') || 'Posição Principal'}
                htmlFor="primary_position"
                error={errors.primary_position?.message}
              >
                <NativeSelect id="primary_position" {...register('primary_position')}>
                  <option value="">{t('players.form.select') || 'Selecionar posição'}</option>
                  {ALL_POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.fullLabel} ({pos.label})
                    </option>
                  ))}
                </NativeSelect>
              </FormField>

              <FormField label="Pé Preferido" htmlFor="foot" error={errors.foot?.message}>
                <NativeSelect id="foot" {...register('foot')}>
                  <option value="">Selecionar pé dominante</option>
                  <option value="right">Destro (Direito)</option>
                  <option value="left">Canhoto (Esquerdo)</option>
                  <option value="both">Ambidestro</option>
                </NativeSelect>
              </FormField>

              <FormField
                label="Estado Federativo"
                htmlFor="status"
                error={errors.status?.message}
              >
                <NativeSelect id="status" {...register('status')}>
                  <option value="">Selecionar estado</option>
                  <option value="active">Ativo</option>
                  <option value="injured">Lesionado</option>
                  <option value="suspended">Suspenso</option>
                  <option value="inactive">Inativo</option>
                  <option value="retired">Retirado</option>
                </NativeSelect>
              </FormField>

              <FormField
                label={t('players.form.height') || 'Altura (cm)'}
                htmlFor="height_cm"
                error={errors.height_cm?.message}
              >
                <Input
                  id="height_cm"
                  type="number"
                  placeholder="Ex: 182"
                  {...register('height_cm')}
                />
              </FormField>

              <FormField
                label={t('players.form.weight') || 'Peso (kg)'}
                htmlFor="weight_kg"
                error={errors.weight_kg?.message}
              >
                <Input
                  id="weight_kg"
                  type="number"
                  placeholder="Ex: 75"
                  {...register('weight_kg')}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Biografia & Apresentação Desportiva */}
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <CardHeader className="border-b border-outline-variant/20 pb-md">
              <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                <Sparkles className="h-4 w-4 text-primary" />
                Biografia & Apresentação Desportiva
              </CardTitle>
            </CardHeader>
            <CardContent className="p-lg">
              <FormField
                label={t('players.form.bio') || 'Resumo do Percurso Desportivo'}
                htmlFor="bio"
                error={errors.bio?.message}
              >
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Descreva as suas principais características, clubes de formação por onde passou e objetivos de carreira..."
                  {...register('bio')}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Definição de Visibilidade Pública */}
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Visibilidade do Perfil Público</h4>
                  <p className="text-xs text-on-surface-variant">
                    Permite que olheiros, clubes e agentes encontrem o seu perfil nas pesquisas da plataforma.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isPublic}
                    onChange={(e) => setValue('is_public', e.target.checked, { shouldDirty: true })}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-surface-container-highest after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant/30 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Guardar */}
          <div className="flex justify-end pt-sm">
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="gap-xs"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending
                ? (t('players.form.saving') || 'A guardar...')
                : (t('players.form.save') || 'Guardar Alterações')}
            </Button>
          </div>
        </form>
      </div>

      {/* Coluna Lateral (35%) */}
      <div className="space-y-md lg:col-span-1">
        {/* Resumo da Conta & Filiação */}
        <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
          <CardHeader className="border-b border-outline-variant/20 pb-xs">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Estado Federativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-sm p-md text-xs">
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">Clube Atual:</span>
              <span className="font-semibold text-on-surface">
                {player.current_club?.name || 'Sem vínculo ativo'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">Posição Principal:</span>
              <span className="font-semibold text-on-surface">
                {player.position_label || player.primary_position}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">Pé Dominante:</span>
              <span className="font-semibold capitalize text-on-surface">
                {player.foot ? (player.foot === 'right' ? 'Destro' : player.foot === 'left' ? 'Canhoto' : 'Ambidestro') : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-on-surface-variant">Estatura / Peso:</span>
              <span className="font-semibold text-on-surface">
                {player.height_cm ? `${player.height_cm} cm` : '—'} / {player.weight_kg ? `${player.weight_kg} kg` : '—'}
              </span>
            </div>

            <div className="pt-xs">
              <Button asChild variant="outline" size="sm" className="w-full gap-xs text-xs">
                <Link to={playerRoutes.linkClub}>
                  <Handshake className="h-3.5 w-3.5" />
                  Gerir Vínculos a Clubes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Boas Práticas & Dicas para Atletas */}
        <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
          <CardHeader className="border-b border-outline-variant/20 pb-xs">
            <CardTitle className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              Dicas para Atletas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-sm p-md text-xs text-on-surface-variant">
            <div className="rounded-lg bg-surface-container/50 p-sm">
              <p className="font-medium text-on-surface">Dados biométricos completos</p>
              <p className="mt-0.5 text-[11px]">
                Atletas com peso, altura e pé preferido preenchidos recebem 3x mais pesquisas de olheiros federados.
              </p>
            </div>
            <div className="rounded-lg bg-surface-container/50 p-sm">
              <p className="font-medium text-on-surface">Vídeos e Melhores Momentos</p>
              <p className="mt-0.5 text-[11px]">
                Adicione vídeos de jogadas reais para comprovar a sua velocidade e capacidade técnica.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
