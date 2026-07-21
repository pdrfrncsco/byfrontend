import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/app/layouts'
import { useLogin, useRegister, getPostAuthRedirectPath } from '@/modules/auth/hooks'
import { ROUTES } from '@/constants/routes'
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from '@/modules/auth/schemas'
import { useSeo } from '@/hooks/useSeo'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const isRegisterMode = location.pathname === '/register'

  useSeo(
    isRegisterMode
      ? { title: 'Criar conta', description: 'Crie a sua conta Bolayetu e junte-se ao ecossistema do futebol.', path: '/register' }
      : { title: 'Entrar', description: 'Aceda à sua conta Bolayetu.', path: '/login' },
  )

  const loginMutation = useLogin()
  const registerMutation = useRegister()

  /* ── Login Form ── */
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  /* ── Register Form ── */
  const registerForm = useForm<RegisterFormData>({
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

  // Reset forms when switching modes
  useEffect(() => {
    loginForm.reset()
    registerForm.reset()
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const onLogin = async (data: LoginFormData) => {
    const result = await loginMutation.mutateAsync(data)
    if (result) {
      const redirectTo = await getPostAuthRedirectPath(result.user)
      navigate(redirectTo)
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    const result = await registerMutation.mutateAsync({
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined,
    })
    if (result) {
      const redirectTo = await getPostAuthRedirectPath(result.user)
      navigate(redirectTo)
    }
  }

  const loading = isRegisterMode ? registerMutation.isPending : loginMutation.isPending

  /* ── Shared input classes ── */
  const inputClass =
    'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
  const labelClass = 'block font-title-md text-on-surface mb-sm text-xs'

  return (
    <AuthLayout>
      <div className="glass-panel rounded-xl p-xl max-w-md w-full border border-outline-variant transition-all duration-300">
        <h1 className="font-display-lg text-headline-lg text-on-surface mb-lg text-center">
          {isRegisterMode ? t('auth.login.registerTitle') : t('auth.login.title')}
        </h1>

        {/* ── Login Mode ── */}
        {!isRegisterMode && (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-md">
            {/* Email */}
            <div>
              <label className={labelClass}>{t('auth.login.email')}</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className={inputClass}
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-error mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>{t('auth.login.password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-error mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t('auth.login.submitLoginLoading') : t('auth.login.submitLogin')}
            </button>
          </form>
        )}

        {/* ── Register Mode ── */}
        {isRegisterMode && (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-md">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-sm">
              <div>
                <label className={labelClass}>{t('auth.login.firstName')}</label>
                <input
                  type="text"
                  placeholder="Pedro"
                  className={inputClass}
                  {...registerForm.register('first_name')}
                />
                {registerForm.formState.errors.first_name && (
                  <p className="text-xs text-error mt-1">{registerForm.formState.errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t('auth.login.lastName')}</label>
                <input
                  type="text"
                  placeholder="Francisco"
                  className={inputClass}
                  {...registerForm.register('last_name')}
                />
                {registerForm.formState.errors.last_name && (
                  <p className="text-xs text-error mt-1">{registerForm.formState.errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>{t('auth.login.email')}</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className={inputClass}
                {...registerForm.register('email')}
              />
              {registerForm.formState.errors.email && (
                <p className="text-xs text-error mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>{t('auth.login.phone')}</label>
              <input
                type="tel"
                placeholder="+244 923 000 000"
                className={inputClass}
                {...registerForm.register('phone')}
              />
              {registerForm.formState.errors.phone && (
                <p className="text-xs text-error mt-1">{registerForm.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>{t('auth.login.password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...registerForm.register('password')}
              />
              {registerForm.formState.errors.password && (
                <p className="text-xs text-error mt-1">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div>
              <label className={labelClass}>{t('auth.login.confirmPassword')}</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...registerForm.register('password_confirm')}
              />
              {registerForm.formState.errors.password_confirm && (
                <p className="text-xs text-error mt-1">{registerForm.formState.errors.password_confirm.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t('auth.login.submitRegisterLoading') : t('auth.login.submitRegister')}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="mt-lg space-y-sm text-center">
          <p className="font-body-md text-on-surface-variant text-sm">
            {isRegisterMode ? t('auth.login.hasAccount') : t('auth.login.noAccount')}{' '}
            <button
              onClick={() => navigate(isRegisterMode ? '/login' : '/register')}
              className="text-primary hover:text-primary-fixed transition-colors font-bold underline bg-transparent border-0 cursor-pointer"
            >
              {isRegisterMode ? t('auth.login.loginLink') : t('auth.login.registerLink')}
            </button>
          </p>
          {!isRegisterMode && (
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="block font-body-md text-on-surface-variant hover:text-primary transition-colors text-xs cursor-pointer bg-transparent border-0"
            >
              {t('auth.login.forgotPassword')}
            </button>
          )}
          <p className="font-body-md text-on-surface-variant text-sm">
            {t('auth.login.organizationCta')}{' '}
            <button
              type="button"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="text-primary hover:text-primary-fixed transition-colors font-bold underline bg-transparent border-0 cursor-pointer"
            >
              {t('auth.login.organizationLink')}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
