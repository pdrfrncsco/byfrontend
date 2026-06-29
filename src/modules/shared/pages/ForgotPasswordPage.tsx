import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { useForgotPassword } from '@/modules/auth/hooks'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/modules/auth/schemas'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPassword()

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
  const labelClass = 'block font-title-md text-on-surface mb-sm text-xs'

  return (
    <AuthLayout>
      <div className="glass-panel rounded-xl p-xl max-w-md w-full border border-outline-variant">
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors text-sm mb-lg group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Login
        </button>

        {submitted ? (
          /* Success state */
          <div className="text-center space-y-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="font-display-lg text-headline-md text-on-surface">Email Enviado</h1>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              Se existir uma conta com o email{' '}
              <strong className="text-on-surface">{submittedEmail}</strong>, receberá um link para
              redefinir a sua palavra-passe em breve.
            </p>
            <p className="text-xs text-on-surface-variant opacity-60">
              Verifique também a pasta de spam ou lixo.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md cursor-pointer mt-md"
            >
              Voltar ao Login
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="flex justify-center mb-lg">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <Mail className="w-7 h-7 text-primary" />
              </div>
            </div>

            <h1 className="font-display-lg text-headline-md text-on-surface mb-sm text-center">
              Recuperar Palavra-passe
            </h1>
            <p className="text-sm text-on-surface-variant text-center mb-lg leading-relaxed">
              Introduza o seu email e enviaremos um link para redefinir a sua palavra-passe.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
              <div>
                <label className={labelClass}>Email</label>
                <input
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
                className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {forgotPasswordMutation.isPending ? 'A Enviar...' : 'Enviar Link de Recuperação'}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
