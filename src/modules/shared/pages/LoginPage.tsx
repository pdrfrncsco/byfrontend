import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { useLogin, getPostAuthRedirectPath } from '@/modules/auth/hooks'
import { ROUTES } from '@/constants/routes'
import { loginSchema, type LoginFormData } from '@/modules/auth/schemas'
import { useSeo } from '@/hooks/useSeo'
import { PasswordInput } from '@/components/ui/password-input'
import { ArrowRight, ShieldCheck, Trophy, LogIn } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useSeo({
    title: 'Entrar',
    description: 'Aceda à sua conta Bolayetu e gira o seu futebol.',
    path: '/login',
  })

  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onLogin = async (data: LoginFormData) => {
    const result = await loginMutation.mutateAsync(data)
    if (result) {
      const redirectTo = await getPostAuthRedirectPath(result.user)
      navigate(redirectTo)
    }
  }

  const loading = loginMutation.isPending

  const inputClass =
    'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
  const labelClass = 'block font-title-md text-on-surface mb-1.5 text-xs font-semibold'

  return (
    <AuthLayout
      panelProps={{
        badge: 'Ecossistema Digital Unificado',
        title: 'Gestão Inteligente para Federações, Clubes e Atletas',
        quote:
          'A BolaYetu centralizou os nossos jogos, registos de atletas e súmulas eletrónicas com total fiabilidade.',
        author: 'Manuel Neto, Diretor de Competições',
        stats: [
          {
            icon: Trophy,
            value: '+50',
            label: 'Competições Ativas',
            colorClass: 'text-primary',
          },
          {
            icon: ShieldCheck,
            value: '+10.000',
            label: 'Atletas Registados',
            colorClass: 'text-emerald-500',
          },
        ],
      }}
    >
      <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-md w-full border border-outline-variant shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
            {t('auth.login.title', 'Iniciar Sessão')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5">
            Introduza os seus dados para aceder à plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
          {/* Email */}
          <div>
            <label className={labelClass} htmlFor="email">
              {t('auth.login.email', 'Email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
              className={inputClass}
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass} htmlFor="password">
                {t('auth.login.password', 'Palavra-passe')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline transition-colors"
                tabIndex={-1}
              >
                {t('auth.login.forgotPassword', 'Esqueceu a palavra-passe?')}
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed px-lg py-3 font-bold rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/20"
          >
            {loading ? (
              t('auth.login.submitLoginLoading', 'A autenticar...')
            ) : (
              <>
                <span>{t('auth.login.submitLogin', 'Entrar na Conta')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links & Roles Distinction */}
        <div className="mt-8 pt-6 border-t border-outline-variant/60 space-y-3 text-center">
          <p className="text-sm text-on-surface-variant">
            {t('auth.login.noAccount', 'Ainda não tem conta?')}{' '}
            <Link
              to={ROUTES.REGISTER}
              className="text-primary hover:underline font-bold transition-colors"
            >
              {t('auth.login.registerLink', 'Criar Conta')}
            </Link>
          </p>

          <div className="bg-surface-container/60 rounded-lg p-3 text-xs text-on-surface-variant border border-outline-variant/40">
            <span className="font-semibold text-on-surface">Federação, Associação ou Liga?</span>
            <div className="mt-1">
              <Link
                to={ROUTES.REGISTER_ORGANIZATION}
                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
              >
                Registar Organização Oficial
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
