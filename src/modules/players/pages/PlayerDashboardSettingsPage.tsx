import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ExternalLink,
  Folder,
  Globe,
  Handshake,
  HelpCircle,
  Info,
  LayoutDashboard,
  Lock,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Video,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  NativeSelect,
  Textarea,
} from '@/components/ui'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { FormField } from '@/components/ui/form-field'
import { EmptyState } from '@/components/ui/empty-state'
import { resolveMediaUrl } from '@/lib/media'
import {
  PlayerAchievementsSection,
  PlayerAvatarUpload,
  PlayerDocumentsSection,
  PlayerIdentityDocumentsSection,
  PlayerVideosSection,
  PlayerContactSettingsPanel,
  PlayerPrivacySettingsPanel,
} from '../components'
import { usePlayerMe, useUpdatePlayerMe } from '../hooks'
import { playerUpdateSchema, type PlayerUpdateFormData } from '../schemas'
import { ALL_POSITIONS, POSITION_COLOR, STATUS_COLOR } from '../constants'
import { playerRoutes } from '../routes'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerDashboardSettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()
  const updateMutation = useUpdatePlayerMe()

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

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

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações do Perfil"
        subtitle="A carregar preferências e dados..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Configurações do Perfil"
        subtitle="Gestão desportiva pessoal"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title={t('players.dashboard.settingsNotFoundTitle') || 'Jogador não encontrado'}
          description={t('players.dashboard.settingsNotFoundDescription') || 'Não foi possível carregar os dados do perfil.'}
          action={{
            label: t('players.common.back') || 'Voltar ao Painel',
            onClick: () => navigate(playerRoutes.dashboard),
            variant: 'secondary',
          }}
        />
      </DashboardLayout>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#534ab7'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const resolvedPhoto = resolveMediaUrl(avatar || player.profile_photo_url || player.avatar)

  return (
    <DashboardLayout
      title={player.full_name}
      subtitle="Definições do perfil, dados desportivos, documentos e privacidade"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-lg">
        {/* ─── 1. PAGE HEADER / HERO BAR (EXECUTIVE DESIGN SYSTEM) ─────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white shadow-sm"
              style={{ background: positionColor }}
            >
              {resolvedPhoto ? (
                <img
                  src={resolvedPhoto}
                  alt={player.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-xs">
                <h1 className="text-xl font-bold text-on-surface">{player.full_name}</h1>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: positionColor, color: positionColor }}
                >
                  {player.position_label || player.primary_position}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: statusColor, color: statusColor, background: `${statusColor}15` }}
                >
                  {player.status_label || player.status}
                </Badge>
              </div>

              <p className="flex items-center gap-xs text-xs text-on-surface-variant">
                <span>{player.current_club?.name || 'Sem Clube Oficial'}</span>
                <span>•</span>
                <span>{player.nationality || 'Angola'}</span>
                {player.age ? (
                  <>
                    <span>•</span>
                    <span>{player.age} anos</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-xs">
            <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
              <Link to={playerRoutes.detail(player.slug)}>
                <ExternalLink className="h-3.5 w-3.5" />
                Perfil Público
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(playerRoutes.dashboard)}
              className="gap-xs text-xs"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Painel
            </Button>
          </div>
        </div>

        {/* ─── 2. TABS NAVIGATION WITH ICONS ──────────────────────────── */}
        <Tabs defaultValue="profile" className="space-y-lg">
          <TabsList className="flex flex-wrap gap-xs rounded-2xl border border-outline-variant/30 bg-surface-container/60 p-1.5 shadow-xs">
            <TabsTrigger value="profile" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <User className="h-4 w-4" />
              Perfil & Biometria
            </TabsTrigger>
            <TabsTrigger value="identity" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <ShieldCheck className="h-4 w-4" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Phone className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Lock className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Folder className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Video className="h-4 w-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Award className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB: PERFIL & BIOMETRIA (65/35 LAYOUT) ───────────────── */}
          <TabsContent value="profile">
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

                  {/* Informações Pessoais */}
                  <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                    <CardHeader className="border-b border-outline-variant/20 pb-md">
                      <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                        <Shield className="h-4 w-4 text-primary" />
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
                          <option value="active">Ativo para Competição</option>
                          <option value="inactive">Inativo Temporário</option>
                          <option value="retired">Retirado / Veterano</option>
                        </NativeSelect>
                      </FormField>

                      <FormField label="Altura (cm)" htmlFor="height_cm" error={errors.height_cm?.message}>
                        <Input
                          id="height_cm"
                          type="number"
                          placeholder="Ex: 182"
                          min={100}
                          max={250}
                          {...register('height_cm')}
                        />
                      </FormField>

                      <FormField label="Peso (kg)" htmlFor="weight_kg" error={errors.weight_kg?.message}>
                        <Input
                          id="weight_kg"
                          type="number"
                          placeholder="Ex: 75"
                          min={30}
                          max={200}
                          {...register('weight_kg')}
                        />
                      </FormField>
                    </CardContent>
                  </Card>

                  {/* Biografia / Resumo da Carreira */}
                  <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                    <CardHeader className="border-b border-outline-variant/20 pb-md">
                      <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                        <Info className="h-4 w-4 text-primary" />
                        Biografia & Histórico Pessoal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-lg">
                      <FormField
                        label={t('players.form.bio') || 'Apresentação do Atleta'}
                        htmlFor="bio"
                        error={errors.bio?.message}
                      >
                        <Textarea
                          id="bio"
                          rows={4}
                          placeholder="Descreva o seu percurso, principais qualidades técnicas e objetivos desportivos..."
                          {...register('bio')}
                        />
                      </FormField>
                    </CardContent>
                  </Card>

                  {/* Visibilidade do Perfil */}
                  <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                    <CardContent className="p-lg">
                      <div className="flex items-start gap-md">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container/20 text-primary">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-xs">
                          <div className="flex items-center justify-between">
                            <label htmlFor="is_public" className="cursor-pointer text-sm font-semibold text-on-surface">
                              {t('players.form.publicProfile') || 'Visibilidade do Perfil Público'}
                            </label>
                            <Badge variant={isPublic ? 'success' : 'secondary'} className="text-[11px]">
                              {isPublic ? 'Público' : 'Privado'}
                            </Badge>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {t('players.form.publicProfileHint') ||
                              'Quando ativo, o seu perfil pode ser encontrado por olheiros, clubes e agentes no diretório público do Bola Yetu.'}
                          </p>
                          <div className="pt-xs">
                            <label className="inline-flex cursor-pointer items-center gap-xs text-xs font-medium text-primary">
                              <input
                                id="is_public"
                                type="checkbox"
                                {...register('is_public')}
                                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                              />
                              <span>Manter perfil visível no diretório de talentos</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botão de Gravação Prominente */}
                  <div className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md">
                    <div className="flex items-center gap-xs text-xs text-on-surface-variant">
                      {isDirty ? (
                        <span className="flex items-center gap-1 font-medium text-amber-600">
                          <Info className="h-3.5 w-3.5" />
                          Existem alterações não gravadas.
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Todos os dados estão atualizados.
                        </span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={updateMutation.isPending}
                      disabled={!isDirty}
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
                        Adicione lances na aba "Vídeos" para demonstrar a sua visão de jogo e tomada de decisão.
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface-container/50 p-sm">
                      <p className="font-medium text-on-surface">Documento de Identidade</p>
                      <p className="mt-0.5 text-[11px]">
                        Mantenha o seu BI ou passaporte validado para agilizar as inscrições federativas da época.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB: IDENTIDADE ──────────────────────────────────────── */}
          <TabsContent value="identity">
            <PlayerIdentityDocumentsSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: CONTACTO ────────────────────────────────────────── */}
          <TabsContent value="contact">
            <PlayerContactSettingsPanel slug={player.slug} />
          </TabsContent>

          {/* ─── TAB: PRIVACIDADE ─────────────────────────────────────── */}
          <TabsContent value="privacy">
            <PlayerPrivacySettingsPanel slug={player.slug} />
          </TabsContent>

          {/* ─── TAB: DOCUMENTOS ──────────────────────────────────────── */}
          <TabsContent value="documents">
            <PlayerDocumentsSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: VÍDEOS ──────────────────────────────────────────── */}
          <TabsContent value="videos">
            <PlayerVideosSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: CONQUISTAS ──────────────────────────────────────── */}
          <TabsContent value="achievements">
            <PlayerAchievementsSection slug={player.slug} ownerId={player.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
