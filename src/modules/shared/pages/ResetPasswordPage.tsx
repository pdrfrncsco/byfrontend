import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { authApi } from '@/modules/auth/services/auth.api'
import { CheckCircle, KeyRound, AlertTriangle } from 'lucide-react'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Validate token presence immediately
  useEffect(() => {
    if (!token) {
      setErrorMsg('Link inválido. Por favor solicite um novo link de recuperação.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== newPasswordConfirm) {
      setErrorMsg('As palavras-passe não coincidem.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      await authApi.resetPassword({
        token,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      })
      setSuccess(true)
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.message) {
        setErrorMsg(data.message)
      } else if (data?.errors?.new_password) {
        setErrorMsg(data.errors.new_password.join(' '))
      } else {
        setErrorMsg('Ocorreu um erro. O link pode ter expirado. Por favor solicite um novo.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = getStrength(newPassword)
  const strengthLabel = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][strength]
  const strengthColor = ['bg-error', 'bg-error', 'bg-warning', 'bg-tertiary', 'bg-primary'][strength]

  return (
    <AuthLayout>
      <div className="glass-panel rounded-xl p-xl max-w-md w-full border border-outline-variant">

        {success ? (
          /* Success state */
          <div className="text-center space-y-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="font-display-lg text-headline-md text-on-surface">
              Palavra-passe Redefinida
            </h1>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              A sua palavra-passe foi atualizada com sucesso. Pode agora iniciar sessão com a nova palavra-passe.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md cursor-pointer"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-lg">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <KeyRound className="w-7 h-7 text-primary" />
              </div>
            </div>

            <h1 className="font-display-lg text-headline-md text-on-surface mb-sm text-center">
              Nova Palavra-passe
            </h1>

            {email && (
              <p className="text-xs text-on-surface-variant text-center mb-lg opacity-70">
                Conta: <span className="font-semibold text-on-surface">{email}</span>
              </p>
            )}

            {errorMsg && (
              <div className="mb-md p-md bg-error-container/30 border border-error text-error rounded-lg text-sm flex items-start gap-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!token ? (
              <div className="text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-primary hover:underline text-sm font-semibold cursor-pointer"
                >
                  Solicitar novo link de recuperação
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-md">
                <div>
                  <label className="block font-title-md text-on-surface mb-sm text-xs">
                    Nova Palavra-passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="••••••••"
                    required
                    autoFocus
                    minLength={8}
                  />
                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="mt-sm space-y-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor : 'bg-outline-variant'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-on-surface-variant">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-title-md text-on-surface mb-sm text-xs">
                    Confirmar Nova Palavra-passe
                  </label>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={e => setNewPasswordConfirm(e.target.value)}
                    className={`w-full px-md py-sm bg-surface-container-low border rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none transition-colors text-sm ${
                      newPasswordConfirm && newPassword !== newPasswordConfirm
                        ? 'border-error focus:border-error'
                        : 'border-outline-variant focus:border-primary'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                    <p className="text-xs text-error mt-1">As palavras-passe não coincidem</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'A Guardar...' : 'Redefinir Palavra-passe'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </AuthLayout>
  )
}
