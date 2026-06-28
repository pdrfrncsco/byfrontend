import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { authApi } from '@/modules/auth/services/auth.api'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      await authApi.forgotPassword(email)
      setSubmitted(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setErrorMsg(msg || 'Ocorreu um erro. Por favor tente novamente.')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="font-display-lg text-headline-md text-on-surface">
              Email Enviado
            </h1>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              Se existir uma conta com o email <strong className="text-on-surface">{email}</strong>,
              receberá um link para redefinir a sua palavra-passe em breve.
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

            {errorMsg && (
              <div className="mb-md p-md bg-error-container/30 border border-error text-error rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-md">
              <div>
                <label className="block font-title-md text-on-surface mb-sm text-xs">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'A Enviar...' : 'Enviar Link de Recuperação'}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
