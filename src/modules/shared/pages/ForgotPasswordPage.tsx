import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { useForgotPassword } from '@/modules/auth/hooks'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/modules/auth/schemas'
import { ArrowLeft, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { ROUTES } from '@/constants/routes'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPassword()

  useSeo({ title: 'Recuperar palavra-passe', path: '/forgot-password', noIndex: true })

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const submitted = forgotPasswordMutation.isSuccess
  const submittedEmail = getValues('email')

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPasswordMutation.mutateAsync(data.email)
  }

  const inputClass =
    'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
  const labelClass = 'block font-title-md text-on-surface mb-1 text-xs font-semibold'

  return (
    <AuthLayout>
      <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-md w-full border border-outline-variant shadow-xl">
        {/* Back button */}
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Voltar ao Login
        </Link>

        {submitted ? (
          /* Success state */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <h1 className="font-display-lg text-2xl font-bold text-on-surface">Email Enviado</h1>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              Se existir uma conta com o email{' '}
              <strong className="text-on-surface">{submittedEmail}</strong>, receberá um link para
              redefinir a sua palavra-passe em breve.
            </p>
            <p className="text-xs text-on-surface-variant opacity-70">
              Verifique também a pasta de spam ou lixo.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-on-primary-fixed px-lg py-3 font-bold rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm cursor-pointer mt-2 shadow-md shadow-primary/20"
            >
              Voltar ao Login
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <Mail className="w-6 h-6" />
              </div>
            </div>

            <h1 className="font-display-lg text-2xl font-bold text-on-surface mb-1 text-center">
              Recuperar Palavra-passe
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
              Introduza o seu email registado e enviaremos um link para redefinir a sua palavra-passe.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="forgot_email">
                  Email
                </label>
                <input
                  id="forgot_email"
                  type="email"
                  placeholder="seu@email.com"
                  className={inputClass}
                  autoFocus
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed px-lg py-3 font-bold rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/20"
              >
                {forgotPasswordMutation.isPending ? (
                  'A Enviar...'
                ) : (
                  <>
                    <span>Enviar Link de Recuperação</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
