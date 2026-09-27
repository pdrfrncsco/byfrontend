import { Link } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import {
  ArrowRight,
  Building2,
  Shield,
  Star,
  User,
  Search,
  CheckCircle2,
} from 'lucide-react'
import { sharedRoutes } from '@/modules/shared/routes'

interface RoleOption {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  href?: string
  icon: typeof User
  badge?: string
  badgeColor?: string
  popular?: boolean
  disabled?: boolean
}

const roleOptions: RoleOption[] = [
  {
    id: 'player',
    title: 'Atleta / Jogador',
    subtitle: 'Conta Individual',
    description:
      'Crie a sua ficha profissional, registe estatísticas, histórico de carreira e solicite vínculo ao seu clube.',
    features: ['Perfil público & estatísticas', 'Histórico de transferências', 'Pedido de filiação a clubes'],
    href: sharedRoutes.registerPlayer,
    icon: User,
    badge: 'Atletas',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'club',
    title: 'Clube / Academia',
    subtitle: 'Gestão de Equipa',
    description:
      'Administre planteis, categorias de base, inscrições em competições oficiais e gestão de transferências.',
    features: ['Gestão de planteis e categorias', 'Inscrição em competições', 'Aprovação de vínculos de atletas'],
    href: sharedRoutes.registerClub,
    icon: Shield,
    badge: 'Clubes & Academias',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    popular: true,
  },
  {
    id: 'organization',
    title: 'Federação / Liga / Associação',
    subtitle: 'Entidade Organizadora',
    description:
      'Plataforma completa de governança desportiva, criação de ligas/taças, súmulas digitais e homologação de jogos.',
    features: ['Gestão de competições & regulamentos', 'Súmula eletrónica em tempo real', 'Homologação de clubes & atletas'],
    href: ROUTES.REGISTER_ORGANIZATION,
    icon: Building2,
    badge: 'Institucional',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    id: 'fan',
    title: 'Adepto / Fan',
    subtitle: 'Comunidade & Seguidores',
    description:
      'Acompanhe o seu clube de coração, consulte classificações em direto, estatísticas de atletas e notícias.',
    features: ['Resultados e alertas ao vivo', 'Seguir clubes e jogadores', 'Acesso a notícias e conteúdos'],
    href: sharedRoutes.registerFan,
    icon: Star,
    badge: 'Comunidade',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
]

export function RegisterPage() {
  useSeo({
    title: 'Criar Conta — Escolha o seu Perfil',
    description:
      'Selecione o seu perfil na BolaYetu: Atleta, Clube, Federação ou Adepto e inicie o registo correto.',
    path: '/register',
  })

  return (
    <AuthLayout variant="wide" maxWidth="5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Registo BolaYetu
          </div>
          <h1 className="font-display-lg text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Como deseja utilizar a BolaYetu?
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Selecione o perfil que melhor descreve a sua atividade para aceder às ferramentas e ao
            fluxo de onboarding especializado.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleOptions.map((role) => {
            const Icon = role.icon
            return (
              <Link
                key={role.id}
                to={role.href!}
                className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 p-5 sm:p-6 bg-surface-container-low hover:bg-surface-container hover:shadow-xl hover:-translate-y-1 ${
                  role.popular
                    ? 'border-primary/50 ring-1 ring-primary/20 shadow-md shadow-primary/5'
                    : 'border-outline-variant hover:border-primary/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    {role.badge && (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${role.badgeColor}`}
                      >
                        {role.badge}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    {role.title}
                  </h2>
                  <p className="text-xs font-semibold text-primary/80 mb-2">{role.subtitle}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                    {role.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-1.5 pt-3 border-t border-outline-variant/50">
                    {role.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant/40 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Criar Conta</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Secondary section: Scouting */}
        <div className="rounded-2xl border border-dashed border-outline-variant/80 bg-surface-container-low/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container border border-outline-variant">
              <Search className="h-6 w-6 text-on-surface-variant" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-on-surface">Olheiro / Agente de Futebol (Scouting)</h2>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                  Em Breve
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Módulo de prospeção de talentos e credenciação de agentes FIFA/FAF em fase final de homologação.
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
          >
            Notificar-me no lançamento →
          </Link>
        </div>

        {/* Bottom Switch to Login */}
        <div className="text-center pt-2">
          <p className="text-sm text-on-surface-variant">
            Já tem uma conta na BolaYetu?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              Iniciar Sessão
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
