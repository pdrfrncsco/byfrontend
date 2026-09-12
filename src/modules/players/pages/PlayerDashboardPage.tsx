import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resolveMediaUrl } from '@/lib/media'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  Handshake,
  HeartPulse,
  Plus,
  Share2,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { usePlayerMe, usePlayerMedicalProfile } from '../hooks'
import { playerRoutes } from '../routes'
import { getPlayerSidebarLinks } from '../constants/navigation'
import { POSITION_COLOR } from '../constants'

export function PlayerDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const { data: player, isLoading, isError } = usePlayerMe()
  const { data: medicalProfile } = usePlayerMedicalProfile(player?.id ?? '', !!player?.id)
  const isMedicalFit = medicalProfile?.medical_status === 'fit' || medicalProfile?.medical_clearance === true

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return (
      <DashboardLayout
        title="Painel do Atleta"
        subtitle="A carregar métricas e desempenho..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid gap-md sm:grid-cols-2 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid gap-lg lg:grid-cols-3">
            <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Painel do Atleta"
        subtitle="Gestão desportiva pessoal"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Jogador não encontrado"
          description="Não foi possível carregar as informações do seu perfil."
          action={{
            label: "Explorar Jogadores",
            onClick: () => navigate(ROUTES.PLAYERS),
            variant: "secondary",
          }}
        />
      </DashboardLayout>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#534ab7'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const avatarUrl = resolveMediaUrl(player.avatar || player.profile_photo_url)

  // Technical attributes (dynamically calculated or realistic baseline)
  const technicalAttributes = [
    { label: 'Finalização', value: Math.min(95, 60 + (player.total_goals || 0) * 4), color: '#534ab7' },
    { label: 'Visão & Passe', value: Math.min(92, 65 + (player.total_assists || 0) * 5), color: '#185fa5' },
    { label: 'Físico & Resistência', value: Math.min(90, 70 + (player.total_matches || 0) * 2), color: '#0f6e56' },
    { label: 'Velocidade', value: 84, color: '#854f0b' },
    { label: 'Drible & Controlo', value: 80, color: '#a32d2d' },
  ]

  // Recent career highlights
  const careerEntries = (player.career_history ?? []).slice(0, 3)

  return (
    <DashboardLayout
      title={player.full_name}
      subtitle="Painel operacional · desempenho, carreira e vínculos desportivos"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-lg">
        {/* ─── 1. PAGE HEADER / HERO PROFILE ──────────────────────────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-center gap-md">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold text-white shadow-md"
              style={{ background: positionColor }}
            >
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={player.full_name}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                initials
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-xs">
                <h1 className="text-xl font-bold text-on-surface">{player.full_name}</h1>
                <Badge variant="outline" className="text-xs">
                  {player.position_label || player.primary_position}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {player.status_label || 'Ativo'}
                </Badge>
              </div>

              <p className="text-xs text-on-surface-variant flex items-center gap-xs">
                <span>{player.current_club?.name || 'Sem Clube Oficial'}</span>
                <span>•</span>
                <span>{player.nationality || 'Angola'}</span>
                {player.date_of_birth && (
                  <>
                    <span>•</span>
                    <span>{player.age ? `${player.age} anos` : ''}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-xs shrink-0">
            <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
              <Link to={playerRoutes.detail(player.slug)}>
                <ExternalLink className="h-3.5 w-3.5" />
                Perfil Público
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm" className="gap-xs text-xs">
              <Link to={playerRoutes.dashboardSettings}>
                <Edit className="h-3.5 w-3.5" />
                Editar Perfil
              </Link>
            </Button>
          </div>
        </div>

        {/* ─── 2. KPI ROW (5 CARDS UNIFIED PATTERN) ───────────────────── */}
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-5">
          {/* Jogos */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eeedfe] text-[#534ab7]">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Jogos</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{player.total_matches ?? 0}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
              <Flame className="h-3 w-3" />
              Esta época
            </div>
          </div>

          {/* Golos */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e1f5ee] text-[#0f6e56]">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Golos</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{player.total_goals ?? 0}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Rendimento ativo
            </div>
          </div>

          {/* Assistências */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e6f1fb] text-[#185fa5]">
                <Target className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Assistências</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{player.total_assists ?? 0}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
              Decisivo
            </div>
          </div>

          {/* Disciplina */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#faeeda] text-[#854f0b]">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Disciplina</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">
              {(player as unknown as { yellow_cards?: number }).yellow_cards ?? 0}
              <span className="text-xs font-normal text-on-surface-variant ml-1">Amarelos</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
              <Shield className="h-3 w-3" />
              Fair-play
            </div>
          </div>

          {/* Aptidão Médica */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs col-span-2 sm:col-span-1">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fcebeb] text-[#a32d2d]">
                <HeartPulse className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Aptidão Médica</span>
            </div>
            <div className="text-xl font-bold text-on-surface truncate">
              {isMedicalFit ? 'Apto' : 'Exame Pend.'}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
              {isMedicalFit ? (
                <span className="text-emerald-600">Alta médica ativa</span>
              ) : (
                <span className="text-amber-600">Requer validação</span>
              )}
            </div>
          </div>
        </div>

        {/* ─── 3. BODY 65/35 SPLIT (COL-M & COL-S) ────────────────────── */}
        <div className="grid gap-lg lg:grid-cols-12">
          {/* MAIN COLUMN (65% -> 8 cols) */}
          <div className="space-y-lg lg:col-span-8">
            {/* Performance Stats Bar */}
            <Card className="border border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-sm">
                <div className="flex items-center gap-xs">
                  <Activity className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Desempenho por Área de Jogo</CardTitle>
                </div>
                <Link to={playerRoutes.career} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  Ver histórico <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-sm pt-xs">
                {technicalAttributes.map((attr) => (
                  <div key={attr.label} className="flex items-center gap-sm text-xs">
                    <span className="w-32 shrink-0 font-medium text-on-surface-variant">{attr.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${attr.value}%`, background: attr.color }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-bold text-on-surface">{attr.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Career Timeline Summary */}
            <Card className="border border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-sm">
                <div className="flex items-center gap-xs">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Histórico de Carreira & Clubes</CardTitle>
                </div>
                <Link to={playerRoutes.career} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  Dossiê completo <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-outline-variant/20 pt-xs">
                {careerEntries.length === 0 ? (
                  <p className="text-xs text-on-surface-variant py-sm">
                    Ainda não possui registos federativos anteriores adicionados à carreira.
                  </p>
                ) : (
                  careerEntries.map((c) => {
                    const clubName = c.club || (c as unknown as { club_name?: string }).club_name || 'Clube'
                    const joinedYear = c.joined ? new Date(c.joined).getFullYear().toString() : 'Atual'
                    const matchesCount = c.matches ?? (c as unknown as { appearances?: number }).appearances ?? 0
                    return (
                      <div key={c.id ?? `${clubName}-${joinedYear}`} className="flex items-center justify-between py-sm text-xs">
                        <div className="flex items-center gap-sm">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {clubName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{clubName}</p>
                            <p className="text-[11px] text-on-surface-variant">Desde {joinedYear}</p>
                          </div>
                        </div>
                        <div className="text-right text-on-surface-variant">
                          <span className="font-semibold text-on-surface">{c.goals ?? 0}G</span> · {c.assists ?? 0}A · {matchesCount}J
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Specialized Dossiers Bento Grid */}
            <div className="space-y-xs pt-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Dossiês e Gestão Especializada
              </h3>

              <div className="grid gap-md sm:grid-cols-3">
                {/* Career Card */}
                <Card className="group border border-outline-variant/30 bg-surface transition-all hover:border-primary/50 shadow-xs">
                  <CardContent className="p-md space-y-sm">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-[#eeedfe] p-2 text-[#534ab7]">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">FIFA EPP</Badge>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Carreira & EPP</h4>
                      <p className="mt-0.5 text-xs text-on-surface-variant line-clamp-2">
                        Histórico de clubes e cálculo de solidariedade.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                      <Link to={playerRoutes.career}>
                        Aceder <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Contracts Card */}
                <Card className="group border border-outline-variant/30 bg-surface transition-all hover:border-primary/50 shadow-xs">
                  <CardContent className="p-md space-y-sm">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-[#e1f5ee] p-2 text-[#0f6e56]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">Jurídico</Badge>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Contratos & Agentes</h4>
                      <p className="mt-0.5 text-xs text-on-surface-variant line-clamp-2">
                        Vínculos, cláusulas e representação.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                      <Link to={playerRoutes.contracts}>
                        Aceder <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Medical Card */}
                <Card className="group border border-outline-variant/30 bg-surface transition-all hover:border-primary/50 shadow-xs">
                  <CardContent className="p-md space-y-sm">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-[#fcebeb] p-2 text-[#a32d2d]">
                        <HeartPulse className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">Saúde</Badge>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Dossiê Médico</h4>
                      <p className="mt-0.5 text-xs text-on-surface-variant line-clamp-2">
                        Aptidão física, atestados e exames.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                      <Link to={playerRoutes.medical}>
                        Aceder <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* SIDE COLUMN (35% -> 4 cols) */}
          <div className="space-y-lg lg:col-span-4">
            {/* Quick Actions (2x2 Grid from Prototype) */}
            <Card className="border border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="pb-xs">
                <div className="flex items-center gap-xs">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-bold">Ações Rápidas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-sm pt-xs">
                <div className="grid grid-cols-2 gap-xs">
                  {/* Action 1: Editar Perfil */}
                  <Link
                    to={playerRoutes.dashboardSettings}
                    className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eeedfe] text-[#534ab7]">
                      <Edit className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-xs text-on-surface">Editar perfil</p>
                      <p className="text-[10px] text-on-surface-variant">Atualizar dados</p>
                    </div>
                  </Link>

                  {/* Action 2: Contratos */}
                  <Link
                    to={playerRoutes.contracts}
                    className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f1fb] text-[#185fa5]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-xs text-on-surface">Contratos</p>
                      <p className="text-[10px] text-on-surface-variant">Ver acordos</p>
                    </div>
                  </Link>

                  {/* Action 3: Dossiê Médico */}
                  <Link
                    to={playerRoutes.medical}
                    className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fcebeb] text-[#a32d2d]">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-xs text-on-surface">Dossiê médico</p>
                      <p className="text-[10px] text-on-surface-variant">Aptidão & exames</p>
                    </div>
                  </Link>

                  {/* Action 4: Vincular Clube */}
                  <Link
                    to={playerRoutes.linkClub}
                    className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e1f5ee] text-[#0f6e56]">
                      <Handshake className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-xs text-on-surface">Vínculos</p>
                      <p className="text-[10px] text-on-surface-variant">Pedir filiação</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed (Prototype Pattern) */}
            <Card className="border border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="pb-xs">
                <div className="flex items-center gap-xs">
                  <Clock className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Atividade Recente</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-outline-variant/20 p-sm pt-xs">
                <div className="flex gap-sm py-2 text-xs">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#534ab7]" />
                  <div>
                    <p className="font-semibold text-on-surface">Perfil ativo no sistema</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {player.current_club?.name ? `Filiado ao clube ${player.current_club.name}` : 'Sem filiação ativa'}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70">Atualizado recentemente</span>
                  </div>
                </div>

                <div className="flex gap-sm py-2 text-xs">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0f6e56]" />
                  <div>
                    <p className="font-semibold text-on-surface">Estado médico</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {isMedicalFit ? 'Alta médica desportiva confirmada' : 'Aguardando avaliação periódica'}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70">Registo oficial</span>
                  </div>
                </div>

                <div className="flex gap-sm py-2 text-xs">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#185fa5]" />
                  <div>
                    <p className="font-semibold text-on-surface">Métricas de rendimento</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {player.total_matches ?? 0} partidas e {player.total_goals ?? 0} golos registados
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70">Época em curso</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
