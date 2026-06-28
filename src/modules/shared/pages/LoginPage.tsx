import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { useAuth } from '@/app/providers/AuthProvider'
import { authApi } from '@/modules/auth/services/auth.api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const isRegisterMode = location.pathname === '/register'

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Reset errors when mode changes
  useEffect(() => {
    setErrorMsg(null)
  }, [location.pathname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      if (isRegisterMode) {
        // Register Flow
        if (password !== passwordConfirm) {
          setErrorMsg('As senhas não coincidem.')
          setLoading(false)
          return
        }

        const response = await authApi.register({
          email,
          password,
          password_confirm: passwordConfirm,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
        })

        // login() fetches memberships internally after storing the token
        await login(response.access, response.refresh, response.user)
        navigate('/dashboard')
      } else {
        // Login Flow
        const response = await authApi.login({ email, password })
        await login(response.access, response.refresh, response.user)
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Auth action failed:', err)
      const backendMessage = err.response?.data?.message
      
      if (backendMessage) {
        setErrorMsg(backendMessage)
      } else {
        setErrorMsg(
          isRegisterMode 
            ? 'Erro ao efetuar o registo. Verifique os dados introduzidos.' 
            : 'Email ou palavra-passe incorretos.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-panel rounded-xl p-xl max-w-md w-full border border-outline-variant transition-all duration-300">
        <h1 className="font-display-lg text-headline-lg text-on-surface mb-lg text-center">
          {isRegisterMode ? 'Criar Conta' : 'Login'}
        </h1>

        {errorMsg && (
          <div className="mb-md p-md bg-error-container/30 border border-error text-error rounded-lg text-sm font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          {/* First & Last Name in row for Register */}
          {isRegisterMode && (
            <div className="grid grid-cols-2 gap-sm">
              <div>
                <label className="block font-title-md text-on-surface mb-sm text-xs">Nome</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="Pedro"
                  required={isRegisterMode}
                />
              </div>
              <div>
                <label className="block font-title-md text-on-surface mb-sm text-xs">Apelido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="Francisco"
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-title-md text-on-surface mb-sm text-xs">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Phone for Register */}
          {isRegisterMode && (
            <div>
              <label className="block font-title-md text-on-surface mb-sm text-xs">Telemóvel (Opcional)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
                placeholder="+244 923 000 000"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block font-title-md text-on-surface mb-sm text-xs">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Password Confirmation for Register */}
          {isRegisterMode && (
            <div>
              <label className="block font-title-md text-on-surface mb-sm text-xs">Confirmar Senha</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
                placeholder="••••••••"
                required={isRegisterMode}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading 
              ? (isRegisterMode ? 'A Criar Conta...' : 'A Entrar...') 
              : (isRegisterMode ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        {/* Links */}
        <div className="mt-lg space-y-sm text-center">
          <p className="font-body-md text-on-surface-variant text-sm">
            {isRegisterMode ? 'Já tem conta?' : 'Não tem conta?'}{' '}
            <button
              onClick={() => navigate(isRegisterMode ? '/login' : '/register')}
              className="text-primary hover:text-primary-fixed transition-colors font-bold underline bg-transparent border-0 cursor-pointer"
            >
              {isRegisterMode ? 'Fazer Login' : 'Registar-se'}
            </button>
          </p>
          {!isRegisterMode && (
            <a href="#" className="block font-body-md text-on-surface-variant hover:text-primary transition-colors text-xs">
              Esqueceu a senha?
            </a>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
