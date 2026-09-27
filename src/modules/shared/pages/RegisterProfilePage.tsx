import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout, type EditorialPanelProps } from '@/app/layouts/AuthLayout'
import { useRegister } from '@/modules/auth/hooks'
import { registerSchema, type RegisterFormData } from '@/modules/auth/schemas'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import type { RegisterRequest } from '@/types'
import { PasswordInput } from '@/components/ui/password-input'
import { ArrowRight, ArrowLeft, Trophy, ShieldCheck, Flame, Star, User, Shield, Heart } from 'lucide-react'

interface RegisterProfilePageProps {
  profileType: NonNullable<RegisterRequest['profile_type']>
  title: string
  description: string
  submitLabel: string
  path: string
}

const panelsByRole: Record<string, EditorialPanelProps> = {
  player: {
    badge: 'Perfil Oficial de Atleta',
    title: 'Destaque o seu talento para clubes e olheiros',
    quote:
      'Com a ficha oficial e estatísticas verificadas na BolaYetu, os atletas ganham visibilidade nacional e internacional.',
    author: 'Zito Luvumbo, Atleta Profissional',
    stats: [
      {
        icon: Trophy,
        value: '+10.000',
        label: 'Atletas Registados',
        colorClass: 'text-primary',
      },
      {
        icon: Flame,
        value: '+2.500',
        label: 'Golos Registados',
        colorClass: 'text-amber-500',
      },
    ],
  },
  club: {
    badge: 'Gestão Profissional de Clubes',
    title: 'Planteis, Categorias e Competições no mesmo lugar',
    quote:
      'A inscrição dos atletas nos torneios oficiais e a gestão dos contratos ficou dez vezes mais rápida e organizada.',
    author: 'Carlos Manuel, Diretor Desportivo',
    stats: [
      {
        icon: ShieldCheck,
        value: '+150',
        label: 'Clubes Registados',
        colorClass: 'text-emerald-500',
      },
      {
        icon: Trophy,
        value: '+80',
        label: 'Torneios Disputados',
        colorClass: 'text-primary',
      },
    ],
  },
  fan: {
    badge: 'Comunidade Desportiva',
    title: 'Viva a paixão do futebol em tempo real',
    quote:
      'Acompanho todos os jogos do campeonato ao minuto e tenho acesso a todas as estatísticas e fichas dos jogadores.',
    author: 'Esperança Costa, Adepta',
    stats: [
      {
        icon: Star,
        value: '+50.000',
        label: 'Adeptos Conectados',
        colorClass: 'text-amber-500',
      },
      {
        icon: Flame,
        value: 'Live',
        label: 'Súmulas em Tempo Real',
        colorClass: 'text-primary',
      },
    ],
  },
}

const roleIcons: Record<string, typeof User> = {
  player: User,
  club: Shield,
  fan: Heart,
}

export function RegisterProfilePage({
  profileType,
  title,
  description,
  submitLabel,
  path,
}: RegisterProfilePageProps) {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  useSeo({
    title,
    description,
    path,
  })

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerMutation.mutateAsync({
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined,
      profile_type: profileType,
    })

    if (result) {
      if (profileType === 'club') {
        navigate(ROUTES.CLUB_ONBOARDING)
      } else if (profileType === 'player') {
        navigate(ROUTES.ONBOARDING_PLAYER)
      } else {
        navigate(ROUTES.DASHBOARD)
      }
    }
  }

  const inputClass =
    'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
  const labelClass = 'block font-title-md text-on-surface mb-1 text-xs font-semibold'

  const RoleIcon = roleIcons[profileType] || User
  const editorialPanel = panelsByRole[profileType] || panelsByRole.player

  return (
    <AuthLayout panelProps={editorialPanel}>
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-xl">
        {/* Top Back Nav */}
        <Link
          to={ROUTES.REGISTER}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Alterar tipo de perfil
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <RoleIcon className="h-4 w-4" />
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-primary">
              {profileType === 'player'
                ? 'Conta de Atleta'
                : profileType === 'club'
                  ? 'Conta de Clube'
                  : 'Conta de Adepto'}
            </span>
          </div>
          <h1 className="font-display-lg text-2xl font-bold text-on-surface">{title}</h1>
          <p className="mt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="first_name">
                Nome
              </label>
              <input
                id="first_name"
                placeholder="Ex: Pedro"
                autoFocus
                className={inputClass}
                {...form.register('first_name')}
              />
              {form.formState.errors.first_name && (
                <p className="mt-1 text-xs text-error">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="last_name">
                Apelido
              </label>
              <input
                id="last_name"
                placeholder="Ex: Francisco"
                className={inputClass}
                {...form.register('last_name')}
              />
              {form.formState.errors.last_name && (
                <p className="mt-1 text-xs text-error">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className={inputClass}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="phone">
              Telemóvel (Opcional)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+244 923 000 000"
              className={inputClass}
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              Palavra-passe
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              showStrengthMeter
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="password_confirm">
              Confirmar Palavra-passe
            </label>
            <PasswordInput
              id="password_confirm"
              placeholder="••••••••"
              error={form.formState.errors.password_confirm?.message}
              {...form.register('password_confirm')}
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-lg py-3 font-bold text-on-primary-fixed transition-all hover:scale-[1.01] active:scale-[0.99] text-sm disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
          >
            {registerMutation.isPending ? 'A criar conta...' : submitLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-outline-variant/60 text-center text-xs text-on-surface-variant space-y-2">
          <p>
            Já possui uma conta?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline">
              Iniciar Sessão
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
