import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { useResetPassword } from '@/modules/auth/hooks'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/modules/auth/schemas'
import { CheckCircle, KeyRound, AlertTriangle } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { PasswordInput } from '@/components/ui/password-input'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useSeo({ title: 'Repor palavra-passe', path: '/reset-password', noIndex: true })

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const resetPasswordMutation = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      new_password: '',
      new_password_confirm: '',
    },
  })

  const noToken = !token

  const onSubmit = async (data: ResetPasswordFormData) => {
    await resetPasswordMutation.mutateAsync(data)
  }

  const success = resetPasswordMutation.isSuccess
  const errorMsg = resetPasswordMutation.isError
    ? 'Ocorreu um erro. O link pode ter expirado. Por favor solicite um novo.'
    : noToken
      ? 'Link inválido. Por favor solicite um novo link de recuperação.'
      : null

  const labelClass = 'block font-title-md text-on-surface mb-1 text-xs font-semibold'

  return (
    <AuthLayout>
      <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-md w-full border border-outline-variant shadow-xl">
        {success ? (
          /* Success state */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <h1 className="font-display-lg text-2xl font-bold text-on-surface">
              Palavra-passe Redefinida
            </h1>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              A sua palavra-passe foi atualizada com sucesso. Pode agora iniciar sessão com a sua nova
              credencial.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-on-primary-fixed px-lg py-3 font-bold rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm cursor-pointer shadow-md shadow-primary/20"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <KeyRound className="w-6 h-6" />
              </div>
            </div>

            <h1 className="font-display-lg text-2xl font-bold text-on-surface mb-1 text-center">
              Nova Palavra-passe
            </h1>

            {email && (
              <p className="text-xs text-on-surface-variant text-center mb-6 opacity-80">
                Conta: <span className="font-semibold text-on-surface">{email}</span>
              </p>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-error-container/30 border border-error text-error rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {noToken ? (
              <div className="text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-primary hover:underline text-xs font-semibold cursor-pointer"
                >
                  Solicitar novo link de recuperação
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor="new_password">
                    Nova Palavra-passe
                  </label>
                  <PasswordInput
                    id="new_password"
                    placeholder="••••••••"
                    autoFocus
                    showStrengthMeter
                    error={errors.new_password?.message}
                    {...register('new_password')}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="new_password_confirm">
                    Confirmar Nova Palavra-passe
                  </label>
                  <PasswordInput
                    id="new_password_confirm"
                    placeholder="••••••••"
                    error={errors.new_password_confirm?.message}
                    {...register('new_password_confirm')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full mt-2 bg-primary text-on-primary-fixed px-lg py-3 font-bold rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/20"
                >
                  {resetPasswordMutation.isPending ? 'A Guardar...' : 'Redefinir Palavra-passe'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </AuthLayout>
  )
}
