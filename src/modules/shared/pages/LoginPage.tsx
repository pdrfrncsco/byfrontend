import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Implement login API call
      console.log('Login attempt:', { email, password })
      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard')
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-panel rounded-xl p-xl max-w-md w-full border border-outline-variant">
        <h1 className="font-display-lg text-headline-lg text-on-surface mb-lg text-center">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Email */}
          <div>
            <label className="block font-title-md text-on-surface mb-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-title-md text-on-surface mb-sm">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-lg space-y-sm text-center">
          <p className="font-body-md text-on-surface-variant">
            Não tem conta?{' '}
            <a href="/register" className="text-primary hover:text-primary-fixed transition-colors">
              Registar-se
            </a>
          </p>
          <a href="#" className="block font-body-md text-on-surface-variant hover:text-primary transition-colors">
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </AuthLayout>
  )
}
