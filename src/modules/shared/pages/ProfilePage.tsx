import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { authApi, ProfileUpdateData } from '@/modules/auth/services/auth.api'
import { User, Save, Lock, Shield, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'

type Tab = 'profile' | 'security' | 'memberships'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile form state
  const [firstName, setFirstName] = useState(user?.username?.split(' ')[0] || '')
  const [lastName, setLastName] = useState(user?.username?.split(' ').slice(1).join(' ') || '')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('pt')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Password form state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(false)

    try {
      const data: ProfileUpdateData = {}
      if (firstName) data.first_name = firstName
      if (lastName) data.last_name = lastName
      if (phone) data.phone = phone
      if (language) data.language = language

      await authApi.updateMe(data)
      await refreshUser()
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || 'Erro ao atualizar perfil.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== newPasswordConfirm) {
      setPasswordError('As novas palavras-passe não coincidem.')
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      })
      setPasswordSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.errors?.old_password) {
        setPasswordError('A palavra-passe atual está incorreta.')
      } else if (data?.errors?.new_password) {
        setPasswordError(data.errors.new_password.join(' '))
      } else {
        setPasswordError(data?.message || 'Erro ao alterar palavra-passe.')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Perfil', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <Lock className="w-4 h-4" /> },
    { id: 'memberships', label: 'Organizações', icon: <Shield className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#031427] text-[#d3e4fe]">
      {/* Background */}
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 h-16 flex items-center px-lg bg-[#0b1c30]/80 border-b border-[#26364a]/40 backdrop-blur-xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors text-sm group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h1 className="ml-auto font-display-lg text-lg text-[#94d3c1] uppercase tracking-wider">
          Perfil
        </h1>
      </header>

      <div className="max-w-3xl mx-auto p-lg space-y-lg">
        {/* User Avatar Card */}
        <div className="glass-panel rounded-xl p-lg border border-[#26364a] flex items-center gap-lg">
          <div className="w-16 h-16 rounded-full bg-[#1b2b3f] flex items-center justify-center border-2 border-[#94d3c1] shrink-0">
            <span className="text-2xl font-bold text-[#94d3c1] uppercase">
              {user?.username?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-display-lg text-xl text-[#d3e4fe]">{user?.username || 'Utilizador'}</p>
            <p className="text-sm text-on-surface-variant">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary/20 text-[#94d3c1] border border-primary/30 px-sm py-0.5 rounded-full font-semibold uppercase tracking-wide">
              {user?.role || 'Membro'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-sm text-error hover:text-error/80 transition-colors font-semibold cursor-pointer"
          >
            Terminar Sessão
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-sm border-b border-[#26364a]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-sm px-md py-sm text-sm font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-[#94d3c1] border-[#94d3c1]'
                  : 'text-on-surface-variant border-transparent hover:text-[#d3e4fe]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="glass-panel rounded-xl p-lg border border-[#26364a] space-y-md">
            <h2 className="font-display-lg text-lg text-[#d3e4fe]">Informações Pessoais</h2>

            {profileError && (
              <div className="p-md bg-error-container/30 border border-error text-error rounded-lg text-sm flex items-center gap-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-md bg-primary/10 border border-primary/30 text-[#94d3c1] rounded-lg text-sm flex items-center gap-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Perfil atualizado com sucesso!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Nome</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors"
                  placeholder="Primeiro nome"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Apelido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors"
                  placeholder="Apelido"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-md py-sm bg-[#000f21]/50 border border-[#26364a]/50 rounded-lg text-on-surface-variant text-sm cursor-not-allowed"
              />
              <p className="text-xs text-on-surface-variant opacity-50 mt-1">O email não pode ser alterado diretamente.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Telemóvel</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors"
                placeholder="+244 923 000 000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Idioma</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors cursor-pointer"
              >
                <option value="pt">🇦🇴 Português</option>
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>

            <div className="pt-sm flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center gap-sm bg-primary text-on-primary-fixed px-lg py-sm font-bold rounded-lg hover:scale-[1.02] transition-transform text-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {profileLoading ? 'A Guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="glass-panel rounded-xl p-lg border border-[#26364a] space-y-md">
            <h2 className="font-display-lg text-lg text-[#d3e4fe]">Alterar Palavra-passe</h2>

            {passwordError && (
              <div className="p-md bg-error-container/30 border border-error text-error rounded-lg text-sm flex items-center gap-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-md bg-primary/10 border border-primary/30 text-[#94d3c1] rounded-lg text-sm flex items-center gap-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Palavra-passe alterada com sucesso!
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Palavra-passe Atual</label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Nova Palavra-passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">Confirmar Nova Palavra-passe</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={e => setNewPasswordConfirm(e.target.value)}
                className={`w-full px-md py-sm bg-[#000f21] border rounded-lg text-[#d3e4fe] text-sm focus:outline-none transition-colors ${
                  newPasswordConfirm && newPassword !== newPasswordConfirm
                    ? 'border-error'
                    : 'border-[#26364a] focus:border-[#94d3c1]'
                }`}
                placeholder="••••••••"
                required
              />
              {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                <p className="text-xs text-error mt-1">As palavras-passe não coincidem</p>
              )}
            </div>

            <div className="bg-[#000f21]/60 border border-[#26364a]/50 rounded-lg p-md text-xs text-on-surface-variant space-y-1">
              <p className="font-semibold text-[#d3e4fe] mb-sm">Requisitos da palavra-passe:</p>
              {[
                ['Mínimo 8 caracteres', newPassword.length >= 8],
                ['Uma letra maiúscula', /[A-Z]/.test(newPassword)],
                ['Um dígito', /[0-9]/.test(newPassword)],
                ['Um carácter especial', /[^A-Za-z0-9]/.test(newPassword)],
              ].map(([label, met]) => (
                <div key={label as string} className="flex items-center gap-sm">
                  <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-[#94d3c1]' : 'bg-[#26364a]'}`} />
                  <span className={met ? 'text-[#94d3c1]' : ''}>{label as string}</span>
                </div>
              ))}
            </div>

            <div className="pt-sm flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-sm bg-primary text-on-primary-fixed px-lg py-sm font-bold rounded-lg hover:scale-[1.02] transition-transform text-sm disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {passwordLoading ? 'A Alterar...' : 'Alterar Palavra-passe'}
              </button>
            </div>
          </form>
        )}

        {/* Memberships Tab */}
        {activeTab === 'memberships' && (
          <div className="glass-panel rounded-xl p-lg border border-[#26364a] space-y-md">
            <h2 className="font-display-lg text-lg text-[#d3e4fe]">Organizações</h2>
            <p className="text-sm text-on-surface-variant">
              Organizações às quais a sua conta está associada e os respetivos cargos.
            </p>

            {user?.roles?.length === 0 || !user?.tenant_id ? (
              <div className="text-center py-xl text-on-surface-variant">
                <Shield className="w-12 h-12 mx-auto mb-md opacity-30" />
                <p className="text-sm">Ainda não pertence a nenhuma organização.</p>
                <p className="text-xs opacity-60 mt-sm">
                  Contacte um administrador para ser adicionado a uma organização.
                </p>
              </div>
            ) : (
              <div className="space-y-sm">
                {user?.tenant_id && (
                  <div className="flex items-center justify-between p-md bg-[#000f21] rounded-lg border border-[#26364a]/50">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-[#1b2b3f] flex items-center justify-center border border-[#26364a]">
                        <Shield className="w-5 h-5 text-[#94d3c1]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#d3e4fe]">Organização Atual</p>
                        <p className="text-xs text-on-surface-variant">{user.tenant_id}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/20 text-[#94d3c1] border border-primary/30 px-sm py-0.5 rounded-full font-bold uppercase">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
